var documenterSearchIndex = {"docs":
[{"location":"core/#Usage-1","page":"Core Monitoring","title":"Usage","text":"","category":"section"},{"location":"core/#Example-1","page":"Core Monitoring","title":"Example","text":"","category":"section"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"Suppose we wanted to measure the number of floating point instructions executed by Julia's BLAS library for a matrix multiply. Note - right off the bat, we don't know for sure which class of AVX instructions the pre-built BLAS libraries use (i.e. 128, 256, or 512 bit)","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"First, we start Julia under numactl. I'm running on a system with 2 sockets, each socket has 24 physical CPUs, 48 hyperthreaded logical CPUs. A note on numbering:","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"CPU numbers 0 to 23 represent distinct physical cores on socket 0.\nCPU numbers 24-47 represent distinct physical cores on socket 1.\nCPU numbers 48-71 represent hyperthreaded cores on socket 0.   That is, CPU 48 and CPU 0 refer to the SAME physical CPU, but different hyper threads.\nCPU numbers 72-95 are hyperthreaded cores on socket 1.","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"By default, Julia uses 8 threads for its BLAS library, so the start command is","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"sudo numactl --physcpubind=24-31 --membind=1 <path/to/julia>","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"Now, in Julia:","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"using CounterTools\n\n# Select the Events we wish to monitor.\n# Event numbers and umasks can be found at:\n#   https://download.01.org/perfmon\n#\n# I'm running this on a Cascade Lake processor, so I'm using the CLX collection\n# of counter values.\n#\n# Since we don't know (yet) what instructions are used by Julia's BLAS library, we\n# include events for\n#\n#   - Scalar Floating Point\n#   - 128b packed\n#   - 256b packed\n#   - 512b packed\n#\n# NOTE: Since hyper threading is enabled, we only have 4 programmable counters available\n# for use.\n# Trying to use more will generate an error.\nevents = (\n    CounterTools.CoreSelectRegister(event = 0xC7, umask = 0x01),   # scalar\n    CounterTools.CoreSelectRegister(event = 0xC7, umask = 0x04),   # 128b\n    CounterTools.CoreSelectRegister(event = 0xC7, umask = 0x10),   # 256b\n    CounterTools.CoreSelectRegister(event = 0xC7, umask = 0x40),   # 512b\n)\n\n# Next, we initialize our arrays and force JIT compilation of the code\nA = rand(Float64, 5000, 5000)\nB = rand(Float64, 5000, 5000)\nA * B\n\n# Now, initialize a CoreMonitor to watch core-level counters\n#\n# This will program the CPU's counters and begin running.\n#\n# Since we've restricted the number of CPUs using `numactl`, we choose to only monitor\n# that subset of CPUs\n#\n# Note that since Julia is Index 1, the CPU range is 25:32 instead of 24:31.\nmonitor = CounterTools.CoreMonitor(25:32, events)\n\n# We can read the current values from the monitor using `read`:\nread(monitor)\n\n# Note that the elements of the result are of type `CounterTools.CoreCounterValue`\n# This is because the counter registers on the CPU are 48-bits wide and thus are\n# likely to overflow at some point.\n#\n# The type `CounterTools.CoreCounterValue` implements a little extra functionality that\n# detects when overlap occurs and automatically corrects for it.\n#\n# Since counters just collect raw counts, this allows for a stream of raw counter values\n# to be collected and then differences to be taken to obtain deltas.\n\n# Now we actually do some monitoring\npre = read(monitor)\nA * B\npost = read(monitor)\ndeltas = map((x, y) -> x .- y, post, pre)\n\ndisplay(deltas)\n# 8-element Array{NTuple{4,Int64},1}:\n#  (0, 0, 7615200000, 0)\n#  (0, 0, 7314600000, 0)\n#  (0, 0, 8016000000, 0)\n#  (0, 0, 8016000000, 0)\n#  (0, 0, 8016000000, 0)\n#  (0, 0, 8016000000, 0)\n#  (0, 0, 7615200000, 0)\n#  (4529, 0, 8016000000, 0)","category":"page"},{"location":"core/#Discussion-of-Results-1","page":"Core Monitoring","title":"Discussion of Results","text":"","category":"section"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"Lets break down what the results mean. First, each entry in the outer array represents the counter results for one CPU in the CPUs we were gathering metrics on. That is, the first entry is CPU 24, the second is CPU 25 etc. The entries themselves correspond to counter deltas for each counter in events. Thus, the first entry is for scalar double-precision floating point operations, the second is for 128b, the third is for 256b, and the fourth is 512b. We observe that JULIA's blas library must use AVX-256 instructions.","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"Now, does the count make sense? Well, lets count up the total number of operations:","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"total_avx_256 = sum(x -> x[3], deltas)\n\n# Multiply by 4 because each AVX-256 instruction operates on 4 Float64s.\ndisplay(4 * total_avx_256)\n# 250500000000","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"Now, we approximate the total number of expected operations on the 5000x5000 matrices.","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"total_expected = 5000^3 * 2\ndisplay(total_expected)\n# 250000000000","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"Note that we multiply by 2 because the multiply-add required for matrix multiplication counts as 2 operations.","category":"page"},{"location":"core/#","page":"Core Monitoring","title":"Core Monitoring","text":"We see that the numbers line up pretty well!","category":"page"},{"location":"uncore/cha/#CHA-Monitoring-1","page":"CHA Monitoring","title":"CHA Monitoring","text":"","category":"section"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"With the Skylake and newer Intel XEON chips, each core on the has: a slice of the total LLC, a \"Caching Home Agent (CHA), and a Snoop Filter. Addresses are assigned to exactly one of these slice/CHA/SF \"boxes\". Normal addresses requests are first checked to see if they are in the LLC, then the Snoop Filter is checked. Remember that the LLC on Xeon systems is non-inclusive with the L2 cache on the processors. The Snoop Filter is responsible for checking whether or not data is in these caches. If data is not in the LLC or SF, then the CHA is responsible for fetching the data, usually from memory via the iMC [1].","category":"page"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"Intel includes a set of performance counters in each of these boxes.","category":"page"},{"location":"uncore/cha/#Determining-the-available-CHAs-1","page":"CHA Monitoring","title":"Determining the available CHAs","text":"","category":"section"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"For the current generation of Xeon chips, there can be up to 28 CHAs on each socket. However, not all of these are in use is the number of cores is fewer.","category":"page"},{"location":"uncore/cha/#Finding-PCI-Bus-address-1","page":"CHA Monitoring","title":"Finding PCI Bus address","text":"","category":"section"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"References:","category":"page"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"[1]: https://software.intel.com/en-us/forums/software-tuning-performance-optimization-platform-monitoring/topic/820002","category":"page"},{"location":"dev/pmu/#The-PMU-Interface-1","page":"The PMU Interface","title":"The PMU Interface","text":"","category":"section"},{"location":"#CounterTools-1","page":"Getting Started","title":"CounterTools","text":"","category":"section"},{"location":"#","page":"Getting Started","title":"Getting Started","text":"This is a test","category":"page"},{"location":"imc/#Integrated-Memory-Controller-(iMC)-Monitoring-1","page":"iMC","title":"Integrated Memory Controller (iMC) Monitoring","text":"","category":"section"},{"location":"imc/#","page":"iMC","title":"iMC","text":"CounterTools allows for programming and reading from the performance counters within the iMC. This is primarily done through the CounterTools.IMCMonitor data type. We'll provide a quick usage summary below for those just looking to get started, and then include some more details later.","category":"page"},{"location":"imc/#Example-1","page":"iMC","title":"Example","text":"","category":"section"},{"location":"imc/#","page":"iMC","title":"iMC","text":"For this example, we will show how to monitor DRAM read and write bandwidth on a 2-socket Cascade Lake Xeon server. Before we get started, we need to know the event and umask codes for these events. For the CLX microarchitecture, this can be found at the following link: https://download.01.org/perfmon/CLX/ (look in the uncore JSON file). We are looking for the events \"UNC_M_CAS_COUNT.RD and UNC_M_CAS_COUNT.WR, both with event number 0x3 and umasks 0x3 and 0xC respectively. These counters record the number of read or write actions performed by the memory controller, where each action involves 64 Bytes of data. Thus, to get the actual bandwidth, you must multiply whatever count number you get by 64.","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"Lets get started.","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"First, start up a Julia session. For the purposes of this demo, we will use numactl to constrain Julia to NUMA node 0 - just to make sure that we're recording the correct information.","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"sudo numactl --cpunodebind=0 --membind=0 <path/to/julia>","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"Now, within Julia, we start the CounterTools package and set-up our events","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"using CounterTools\nevents = (\n    CounterTools.UncoreSelectRegister(; event = 0x4, umask = 0x3),\n    CounterTools.UncoreSelectRegister(; event = 0x4, umask = 0xC),\n)","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"Observe that we're now using CounterTools.UncoreSelectRegisters instead of CounterTools.CoreSelectRegisters. This is because the bit fields of the Uncore selection registers are slightly different than the Core selection registers. Note that construction of a IMCMonitor requires CounterTools.UncoreSelectRegisters.","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"With that, lets instantiate a IMCMonitor!","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"monitor = CounterTools.IMCMonitor(events)","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"This automates the process of programming and starting the iMC performance counters. We can now collect data from the counters:","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"data = read(monitor)\ndisplay(data)","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"WHOA: What the heck is going on?? What is returned by reading data is a somewhat gnarly nested Tuple, but there is a method to this madness. I'm running this on a 2-socket system, so we have performance counter data for each socket. This is the outermost tuple of the returned data.","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"# Performance Counters for Socket 0\ndata[1]\n# Performance Counters for Socket 1\ndata[2]","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"Next, each socket has two memory controllers. This is the next level of hierarchy:","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"# Socket 0, iMC 0\ndata[1][1]\n# Socket 0, iMC 1\ndata[1][2]","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"Each iMC has 3 channels. This is the next level of hierarchy:","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"# Socket 0, iMC 0, Channel 0\ndata[1][1][1]\n# Socket 0, iMC 0, Channel 1\ndata[1][1][2]\n# Socket 0, iMC 0, Channel 2\ndata[1][1][3]","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"Finally, each iMC channel has 4 programmable counters. This is the last level of hierarchy, represented as a 4-tuple of CounterValues The counter values in this last tuple correspond elementwise to the original events used to construct the IMCMonitor. So, data[1][1][1][1] is the counter value of DRAM reads for channel 0, iMC 0, Socket 0. Similarly, data[1][1][1][2] is the value for DRAM writes. Since we didn't program counters 2 or 3 (speaking in index zero terms), those values are simply 0.","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"Now, this can be a lot to take in. Fortunately, we have some helpful tool! First, remember that we generally look for a difference between subsequent samples. Here's an example of using some of the tools to make that happen:","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"# Create a largish array. Precompile \"sum\" function\nA = rand(Float64, 10^7); sum(A);\n\n# Sample counters before and after performing an operation that reads the array\npre = read(monitor);\nsum(A);\npost = read(monitor);\n\n# Now, we aggregate counters across sockets\naggregate = CounterTools.aggregate.(CounterTools.counterdiff(post, pre))\n# (\n#    (1474725, 118291, 0, 0),   # <- Aggregate for Socket 0\n#    (136433, 113153, 0, 0)     # <- Aggregate for Socket 1\n# )","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"Wow! That's much cleaner. This helpful command essentially adds the counter values for all the channels across each socket and returns the sum. We observe that Socket 0 (the one we're running Julia on) has a large number of reads (the first entry in the Tuple) Lets calculate the corresponding number of bytes read","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"bytes_read = aggregate[1][1] * 64\n# 94382400\n\nsizeof(A)\n# 80000000","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"We see a nice correlation here between the monitored number of bytes read and the number of bytes we'd expect to see! Note that there is more traffic on the system than just the reading of the array. For example, other processes on the system are generating DRAM traffic. Plus, our own process is doing things like reading code from DRAM.","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"NOTE: Summing across all channels is not always what you want to do. It's easy to make changes. If, for example, you want to take the maximum across each channel (I'm not sure at the moment why you'd want to, but lets say that you do). It's as simple as","category":"page"},{"location":"imc/#","page":"iMC","title":"iMC","text":"CounterTools.aggregate(max, CounterTools.counterdiff(post, pre))\n# ((247148, 20058, 0, 0), (23139, 19558, 0, 0))","category":"page"}]
}

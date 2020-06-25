var documenterSearchIndex = {"docs":
[{"location":"uncore/cha/#CHA-Monitoring-1","page":"CHA Monitoring","title":"CHA Monitoring","text":"","category":"section"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"With the Skylake and newer Intel XEON chips, each core on the has: a slice of the total LLC, a \"Caching Home Agent (CHA), and a Snoop Filter. Addresses are assigned to exactly one of these slice/CHA/SF \"boxes\". Normal addresses requests are first checked to see if they are in the LLC, then the Snoop Filter is checked. Remember that the LLC on Xeon systems is non-inclusive with the L2 cache on the processors. The Snoop Filter is responsible for checking whether or not data is in these caches. If data is not in the LLC or SF, then the CHA is responsible for fetching the data, usually from memory via the iMC [1].","category":"page"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"Intel includes a set of performance counters in each of these boxes.","category":"page"},{"location":"uncore/cha/#Determining-the-available-CHAs-1","page":"CHA Monitoring","title":"Determining the available CHAs","text":"","category":"section"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"For the current generation of Xeon chips, there can be up to 28 CHAs on each socket. However, not all of these are in use is the number of cores is fewer.","category":"page"},{"location":"uncore/cha/#Finding-PCI-Bus-address-1","page":"CHA Monitoring","title":"Finding PCI Bus address","text":"","category":"section"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"References:","category":"page"},{"location":"uncore/cha/#","page":"CHA Monitoring","title":"CHA Monitoring","text":"[1]: https://software.intel.com/en-us/forums/software-tuning-performance-optimization-platform-monitoring/topic/820002","category":"page"},{"location":"uncore/imc/#Integrated-Memory-Controller-(iMC)-Monitoring-Example-1","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"","category":"section"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"CounterTools allows for programming and reading from the performance counters within the iMC. This is primarily done through the CounterTools.IMCMonitor data type. We'll provide a quick usage summary below for those just looking to get started, and then include some more details later.","category":"page"},{"location":"uncore/imc/#Example-1","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Example","text":"","category":"section"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"For this example, we will show how to monitor DRAM read and write bandwidth on a 2-socket Cascade Lake Xeon server. Before we get started, we need to know the event and umask codes for these events. For the CLX microarchitecture, this can be found at the following link: https://download.01.org/perfmon/CLX/ (look in the uncore JSON file). We are looking for the events \"UNC_M_CAS_COUNT.RD and UNC_M_CAS_COUNT.WR, both with event number 0x3 and umasks 0x3 and 0xC respectively. These counters record the number of read or write actions performed by the memory controller, where each action involves 64 Bytes of data. Thus, to get the actual bandwidth, you must multiply whatever count number you get by 64.","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"Lets get started.","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"First, start up a Julia session. For the purposes of this demo, we will use numactl to constrain Julia to NUMA node 0 - just to make sure that we're recording the correct information.","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"sudo numactl --cpunodebind=0 --membind=0 <path/to/julia>","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"Now, within Julia, we start the CounterTools package and set-up our events","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"using CounterTools\nevents = (\n    CounterTools.UncoreSelectRegister(; event = 0x4, umask = 0x3),\n    CounterTools.UncoreSelectRegister(; event = 0x4, umask = 0xC),\n)","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"Observe that we're now using CounterTools.UncoreSelectRegister instead of CounterTools.CoreSelectRegister. This is because the bit fields of the Uncore selection registers are slightly different than the Core selection registers. Note that construction of a CounterTools.IMCMonitor requires CounterTools.UncoreSelectRegisters.","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"With that, lets instantiate a CounterTools.IMCMonitor! Note that we have to pass which socket we want to monitor. Since we've restricted Julia to running on socket 0 using numactl, this is the socket we pass to IMCMonitor. We wrap it in a CounterTools.IndexZero to indicate that we really do want a literal 0. We could have just as easily passed the integer 1 to achieve the same result.","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"monitor = CounterTools.IMCMonitor(events, CounterTools.IndexZero(0))","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"This automates the process of programming and starting the iMC performance counters. We can now collect data from the counters:","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"data = read(monitor)\ndisplay(data)\n\n# Socket Record with 2 entries:\n#    Imc Record with 3 entries:\n#       Channel Record with 4 entries:\n#          CounterTools.CounterValue\n#\n# Socket:\n#    Imc:\n#       Channel: (CV(873907), CV(437771), CV(0), CV(0))\n#       Channel: (CV(877335), CV(438516), CV(0), CV(0))\n#       Channel: (CV(872746), CV(438298), CV(0), CV(0))\n#    Imc:\n#       Channel: (CV(865708), CV(432371), CV(0), CV(0))\n#       Channel: (CV(866270), CV(430789), CV(0), CV(0))\n#       Channel: (CV(867648), CV(431401), CV(0), CV(0))","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"Lets tease out what's going on here. The top level is a Record{:socket}, which contains the counter results for our socket of interest. Each socket has two Integrated Memory Controllers, which are modeled by the Record{:imc} inside the outermost record. Furthermore, each IMC has three Channels, which are the three Record{:channel} inside each IMC. Finally, each channel has four counters, which correspond to the entries in the Record{:channel}.","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"Now, this can be a lot to take in. Fortunately, we have some helpful tool! First, remember that we generally look for a difference between subsequent samples. Here's an example of using some of the tools to make that happen:","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"# Create a largish array. Precompile \"sum\" function\nA = rand(Float64, 10^7); sum(A);\n\n# Sample counters before and after performing an operation that reads the array\npre = read(monitor);\nsum(A);\npost = read(monitor);\n\n# Now, we aggregate counters across sockets\naggregate = CounterTools.aggregate(post - pre)\n# (1491562, 250617, 0, 0)","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"Wow! That's much cleaner. This helpful command essentially adds the counter values for all the channels across each socket and returns the sum. We observe that Socket 0 (the one we're running Julia on) has a large number of reads (the first entry in the Tuple) Lets calculate the corresponding number of bytes read","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"bytes_read = aggregate[1] * 64\n# 95459968\n\nsizeof(A)\n# 80000000","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"We see a nice correlation here between the monitored number of bytes read and the number of bytes we'd expect to see! Note that there is more traffic on the system than just the reading of the array. For example, other processes on the system are generating DRAM traffic. Plus, our own process is doing things like reading code from DRAM.","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"NOTE: Summing across all channels is not always what you want to do. It's easy to make changes. If, for example, you want to take the maximum across each channel (I'm not sure at the moment why you'd want to, but lets say that you do). It's as simple as","category":"page"},{"location":"uncore/imc/#","page":"Integrated Memory Controller (iMC) Monitoring Example","title":"Integrated Memory Controller (iMC) Monitoring Example","text":"CounterTools.aggregate(max, post - pre)\n# (252053, 42442, 0, 0)","category":"page"},{"location":"monitors/#Monitors-1","page":"Monitors","title":"Monitors","text":"","category":"section"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"The process of setting up and reading from various performance montoring counters is delegated to various Monitor types. These monitors are:","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"CounterTools.CoreMonitor: Collects Core level counters.","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"These counters work on a CPU level granularity and can capture information such as number of retiretired instructions, number of floating point instrucitons, L1/L2 accesses etc.","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"CounterTools.IMCMonitor: Manages counters on the Integrated Memory Controller (iMC).","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"This can record events such as number of DRAM reads and writes.","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"CounterTools.CHAMonitor: Manages counters for the Caching Home Agents (CHA) in the system.","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"This can record events such as number of L3 hits and misses.","category":"page"},{"location":"monitors/#Monitor-API-1","page":"Monitors","title":"Monitor API","text":"","category":"section"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"After creations, all monitors have the same simple API. The most common method will be read, which will read from all of the PMUs currently controlled by the monitor and return the raw counters values in a CounterTools.Record. See the CounterTools.Record documentation for details on working with that data structure.","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"Two additional methods specified by each Monitor are CounterTools.program! and CounterTools.reset!. These methods configure the PMUs and reset the PMUs to their default state respectively. Normally, you will not have to call these methods directly since programming is usually done during monitor creation and CounterTools.reset! is automatically called when the Monitor is garbage collected.","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"A simple usage of this would look like:","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"monitor = # create monitor\n\n# Read once from the counters\nfirst = read(monitor)\n\n# Read again from the coutners\nsecond = read(monitor)\n\n# Automatically compute the counter deltas\ndeltas = second - first\n\n# Aggregate all deltas\nCounterTools.aggregate(deltas)","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"Additionally, if you are working with multiple samples, the following can serve as a template for your code.","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"monitor = # create monitor\ndata = map(1:10) do i\n    sleep(0.1)\n    read(monitor)\nend\n\n# `data` is a `Vector{<:Record}`\n# To compute the counter difference across all samples, we can call Julia's `diff` function:\ndeltas = diff(data)\n\n# Finally, we can aggregate each diff.\nCounterTools.aggregate.(deltas)","category":"page"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"note: Note\nRaw counter values will be wrapped in a CounterTools.CounterValue type that will automatically detect and correct for counter overflow when subtracting counter values.","category":"page"},{"location":"monitors/#Monitor-Documentation-1","page":"Monitors","title":"Monitor Documentation","text":"","category":"section"},{"location":"monitors/#Monitors-2","page":"Monitors","title":"Monitors","text":"","category":"section"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"CounterTools.CoreMonitor\nCounterTools.IMCMonitor\nCounterTools.CHAMonitor","category":"page"},{"location":"monitors/#CounterTools.CoreMonitor","page":"Monitors","title":"CounterTools.CoreMonitor","text":"CoreMonitor(events, cpus; program = true)\n\nConstruct a CoreMonitor monitoring events on cpus. Arguments events should be a Tuple of CounterTools.CoreSelectRegister and cpus is any iterable collection of CPU indices.\n\nIf program == true, then also program the performance counters to on each CPU.\n\n\n\n\n\n","category":"type"},{"location":"monitors/#CounterTools.IMCMonitor","page":"Monitors","title":"CounterTools.IMCMonitor","text":"IMCMonitor(events, socket; [program = true, finalize = true])\n\nMonitor the Integrated Memory Controller (IMC) for events on a single selected CPU socket. This can gather information such as number of DRAM read and write operations.  Argument event should be a Tuple of CounterTools.UncoreSelectRegister and socket should be either an Integer or IndexZero.\n\nIf finalize = true is passed, a finalizer will be attached to the IMCMonitor to clean up the hardware counter's state.\n\n\n\n\n\n","category":"type"},{"location":"monitors/#CounterTools.CHAMonitor","page":"Monitors","title":"CounterTools.CHAMonitor","text":"CHAMonitor(events, socket, cpu; [program = true], [filter0], [filter1])\n\nMonitor the Caching Home Agent counters for events on a single selected CPU socket. This can gather information such as number of L3 hits and misses. Argument event should be a Tuple of CounterTools.UncoreSelectRegister and socket should be either an Integer or IndexZero. Further, cpu is the CPU that will be actually reading the counters. For best performance, cpu should be located on socket.\n\nFilters\n\nThe CHA Performance Monitoring Units allow counters to be filtered in various ways such as issuing Core or Thread ID, request opcode etc.\n\nThese can be passed via the filter0 and filter1 keyword arguments and correspond to the CHA filters 0 and 1 repectively.\n\nNote: filter0 should be a CounterTools.CHAFilter0 and filter1 should be a CounterTools.CHAFilter1.\n\n\n\n\n\n","category":"type"},{"location":"monitors/#API-1","page":"Monitors","title":"API","text":"","category":"section"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"Base.read(::CounterTools.AbstractMonitor)\nCounterTools.program!\nCounterTools.reset!","category":"page"},{"location":"monitors/#Base.read-Tuple{CounterTools.AbstractMonitor}","page":"Monitors","title":"Base.read","text":"read(monitor) -> Record\n\nRead from all counters currently managed by monitor and return the results as a CounterTools.Record.  The structure of the CounterTools.Record usually reflects the hierarchical structure of the counters being monitored.\n\n\n\n\n\n","category":"method"},{"location":"monitors/#CounterTools.program!","page":"Monitors","title":"CounterTools.program!","text":"program!(monitor)\n\nProgram the PMUs managed by monitor. This must be called before any results returned from read will be meaningful.\n\nThis method is called automatically when monitor was created unless the program = false keyword was passed the monitor contructor function.\n\n\n\n\n\n","category":"function"},{"location":"monitors/#CounterTools.reset!","page":"Monitors","title":"CounterTools.reset!","text":"reset!(monitor)\n\nSet the PMUs managed by monitor back to their original state.\n\nThis method is called automatically when monitor is garbage collected unless the reset = false keyword is passed to the monitor constructor function.\n\n\n\n\n\n","category":"function"},{"location":"monitors/#Select-Registers-1","page":"Monitors","title":"Select Registers","text":"","category":"section"},{"location":"monitors/#","page":"Monitors","title":"Monitors","text":"CounterTools.CoreSelectRegister\nCounterTools.UncoreSelectRegister\nCounterTools.CHAFilter0\nCounterTools.CHAFilter1","category":"page"},{"location":"monitors/#CounterTools.CoreSelectRegister","page":"Monitors","title":"CounterTools.CoreSelectRegister","text":"CoreSelectRegister(; kw...)\n\nConstruct a bitmask for programming Core level counters.\n\nKeywords\n\nevent::UInt: Select the event to be counted. Default: 0x00\numask::Uint: Select the subevent to be counted within the selected event. Default: 0x00\nusr::Bool: Specifies the counter should be active when the processor is operating at   privilege modes 1, 2, and 3. Default: true.\nos::Bool: Specifies the counter should be active when the processor is operating at   privilege mode 0. Default: true.\ne::Bool: Edge detect. Default: false.\nen::Bool: Enable the counter. Default: true.\ninv::Bool: When set, inverts the counter-mask (CMASK) comparison, so that both greater   than or equal to and less than comparisons can be made (0: greater than or equal; 1:   less than). Note if counter-mask is programmed to zero, INV flag is ignored. Default: false.\ncmask::Bool: When this field is not zero, a logical processor compares this mask to the   events count of the detected microarchitectural condition during a single cycle. If the   event count is greater than or equal to this mask, the counter is incremented by one.   Otherwise the counter is not incremented.\nThis mask is intended for software to characterize microarchitectural conditions that   can count multiple occurrences per cycle (for example, two or more instructions retired   per clock; or bus queue occupations). If the counter-mask field is 0, then the counter   is incremented each cycle by the event count associated with multiple occurrences.\n\n\n\n\n\n","category":"type"},{"location":"monitors/#CounterTools.UncoreSelectRegister","page":"Monitors","title":"CounterTools.UncoreSelectRegister","text":"UncoreSelectRegister(; kw...)\n\nConstruct a bitmask for programming Uncore level counters.\n\nKeywords\n\nevent::UInt: Select event to be counted. Default: 0x00\numask::UInt: Select subevents to be counted within the selected event. Default: 0x00\nreset::Bool: When set to 1, the corresponding counter will be cleared to 0. Default: false\nedge_detact::Bool: When set to 1, rather than measuring the event in each cycle it is   active, the corresponding counter will increment when a 0 to 1 transition (i.e. rising edge)   is detected.\nWhen 0, the counter will increment in each cycle that the event is asserted.\nNOTE: edge_detect is in series following thresh, Due to this, the thresh field   must be set to a non-0 value. For events that increment by no more than 1 per cycle,   set thresh to 0x1. Default: false.\noverflow_enable::Bool: When this bit is set to 1 and the corresponding counter overflows,   an overflow message is sent to the UBox’s global logic. The message identifies the unit   that sent it. Default: false.\nen::Bool: Local Counter Enable. Default: true.\ninvert::Bool: Invert comparison against Threshold.\n0 - comparison will be ‘is event increment >= threshold?’.\n1 - comparison is inverted - ‘is event increment < threshold?’\ne.g. for a 64-entry queue, if SW wanted to know how many cycles the queue had fewer   than 4 entries, SW should set the threshold to 4 and set the invert bit to 1.   Default: false.\nthresh::UInt: Threshold is used, along with the invert bit, to compare against the   counter’s incoming increment value. i.e. the value that will be added to the counter.\nFor events that increment by more than 1 per cycle, if the threshold is set to a value   greater than 1, the data register will accumulate instances in which the event   increment is >= threshold. Default: 0x00.\n\n\n\n\n\n","category":"type"},{"location":"monitors/#CounterTools.CHAFilter0","page":"Monitors","title":"CounterTools.CHAFilter0","text":"CHAFilter0(; kw...)\n\n\n\n\n\n","category":"type"},{"location":"monitors/#CounterTools.CHAFilter1","page":"Monitors","title":"CounterTools.CHAFilter1","text":"CHAFilter1(; kw...)\n\n\n\n\n\n","category":"type"},{"location":"core/example/#Core-Monitoring-Example-1","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"","category":"section"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"Suppose we wanted to measure the number of floating point instructions executed by Julia's BLAS library for a matrix multiply. Note - right off the bat, we don't know for sure which class of AVX instructions the pre-built BLAS libraries use (i.e. 128, 256, or 512 bit)","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"First, we start Julia under numactl. I'm running on a system with 2 sockets, each socket has 24 physical CPUs, 48 hyperthreaded logical CPUs. A note on numbering:","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"CPU numbers 0 to 23 represent distinct physical cores on socket 0.\nCPU numbers 24-47 represent distinct physical cores on socket 1.\nCPU numbers 48-71 represent hyperthreaded cores on socket 0.   That is, CPU 48 and CPU 0 refer to the SAME physical CPU, but different hyper threads.\nCPU numbers 72-95 are hyperthreaded cores on socket 1.","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"By default, Julia uses 8 threads for its BLAS library, so the start command is","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"sudo numactl --physcpubind=24-31 --membind=1 <path/to/julia>","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"Now, in Julia:","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"using CounterTools\n\n# Select the Events we wish to monitor.\n# Event numbers and umasks can be found at:\n#   https://download.01.org/perfmon\n#\n# I'm running this on a Cascade Lake processor, so I'm using the CLX collection\n# of counter values.\n#\n# Since we don't know (yet) what instructions are used by Julia's BLAS library, we\n# include events for\n#\n#   - Scalar Floating Point\n#   - 128b packed\n#   - 256b packed\n#   - 512b packed\n#\n# NOTE: Since hyper threading is enabled, we only have 4 programmable counters available\n# for use.\n# Trying to use more will generate an error.\nevents = (\n    CounterTools.CoreSelectRegister(event = 0xC7, umask = 0x01),   # scalar\n    CounterTools.CoreSelectRegister(event = 0xC7, umask = 0x04),   # 128b\n    CounterTools.CoreSelectRegister(event = 0xC7, umask = 0x10),   # 256b\n    CounterTools.CoreSelectRegister(event = 0xC7, umask = 0x40),   # 512b\n)\n\n# Next, we initialize our arrays and force JIT compilation of the code\nA = rand(Float64, 5000, 5000)\nB = rand(Float64, 5000, 5000)\nA * B\n\n# Now, initialize a CoreMonitor to watch core-level counters\n#\n# This will program the CPU's counters and begin running.\n#\n# Since we've restricted the number of CPUs using `numactl`, we choose to only monitor\n# that subset of CPUs\n#\n# Note that since Julia is Index 1, the CPU range is 25:32 instead of 24:31.\nmonitor = CounterTools.CoreMonitor(events, 25:32)\n\n# We can read the current values from the monitor using `read`:\nread(monitor)\n\n# Note that the elements of the result are of type `CounterTools.CoreCounterValue`\n# This is because the counter registers on the CPU are 48-bits wide and thus are\n# likely to overflow at some point.\n#\n# The type `CounterTools.CoreCounterValue` implements a little extra functionality that\n# detects when overlap occurs and automatically corrects for it.\n#\n# Since counters just collect raw counts, this allows for a stream of raw counter values\n# to be collected and then differences to be taken to obtain deltas.\n\n# Now we actually do some monitoring\npre = read(monitor)\nA * B\npost = read(monitor)\ndeltas = post - pre\n\ndisplay(deltas)\n# Cpu Set Record with 8 entries:\n#    Cpu Record with 4 entries:\n#       Int64\n#\n# Cpu Set:\n#    Cpu: (0, 0, 7815600000, 0)\n#    Cpu: (0, 0, 7815600000, 0)\n#    Cpu: (0, 0, 7715400000, 0)\n#    Cpu: (0, 0, 7815600000, 0)\n#    Cpu: (0, 0, 7815600000, 0)\n#    Cpu: (0, 0, 7815600000, 0)\n#    Cpu: (0, 0, 7815600000, 0)\n#    Cpu: (4135, 0, 8016000000, 0)","category":"page"},{"location":"core/example/#Discussion-of-Results-1","page":"Core Monitoring Example","title":"Discussion of Results","text":"","category":"section"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"Lets break down what the results mean. First, each entry in the outer record represents the counter results for one CPU in the CPUs we were gathering metrics on. That is, the first entry is CPU 24, the second is CPU 25 etc. The entries themselves correspond to counter deltas for each counter in events. Thus, the first entry is for scalar double-precision floating point operations, the second is for 128b, the third is for 256b, and the fourth is 512b. We observe that JULIA's blas library must use AVX-256 instructions.","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"Now, does the count make sense? Well, lets count up the total number of operations:","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"total_avx_256 = CounterTools.aggregate(deltas)[3]\n\n# Multiply by 4 because each AVX-256 instruction operates on 4 Float64s.\ndisplay(4 * total_avx_256)\n# 250500000000","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"Now, we approximate the total number of expected operations on the 5000x5000 matrices.","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"total_expected = 5000^3 * 2\ndisplay(total_expected)\n# 250000000000","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"Note that we multiply by 2 because the multiply-add required for matrix multiplication counts as 2 operations.","category":"page"},{"location":"core/example/#","page":"Core Monitoring Example","title":"Core Monitoring Example","text":"We see that the numbers line up pretty well!","category":"page"},{"location":"records/#Record-1","page":"Record","title":"Record","text":"","category":"section"},{"location":"records/#","page":"Record","title":"Record","text":"Counter values and intermediate counter deltas are stored as CounterTools.Records. This data structure can model the hierarchical layout of performance counters in a way that is not particularly mind-bending to deal with.","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"Working with CounterTools.Records is pretty easy. Records wrap either Tuples or Arrays, and have a name:","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"julia> using CounterTools\n\njulia> record_1 = CounterTools.Record{:A}((1, 1))\nA Record with 2 entries:\n   Int64\n\nA: (1, 1)","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"Records can be indexed:","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"julia> record_1[1]\n1","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"Records can be nested","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"julia> record_2 = CounterTools.Record{:A}((1,2))\nA Record with 2 entries:\n   Int64\n\nA: (1, 2)\n\njulia> record = CounterTools.Record{:top}((record_1, record_2))\nTop Record with 2 entries:\n   A Record with 2 entries:\n      Int64\n\nTop:\n   A: (1, 1)\n   A: (1, 2)","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"Of course, nested records can be indexed as well","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"julia> record[2][2]\n2","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"Records can be subtracted from one another The resulting Record has the same structure as the original records","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"julia> record - record\nTop Record with 2 entries:\n   A Record with 2 entries:\n      Int64\n\nTop:\n   A: (0, 0)\n   A: (0, 0)","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"All the leaf entries can be summed together using CounterTools.aggregate","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"julia> CounterTools.aggregate(record)\n(2, 3)","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"If you want to apply a function to all of the leaf elements of a record, use CounterTools.mapleaves","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"julia> CounterTools.mapleaves(x -> 2x, record)\nTop Record with 2 entries:\n   A Record with 2 entries:\n      Int64\n\nTop:\n   A: (2, 2)\n   A: (2, 4)","category":"page"},{"location":"records/#Common-Usage-1","page":"Record","title":"Common Usage","text":"","category":"section"},{"location":"records/#","page":"Record","title":"Record","text":"Commonly, Records will be collected as a vector and the leaf elements of Records will be CounterTools.CounterValue. The easiest way to take counter differences and aggregate is use the following:","category":"page"},{"location":"records/#","page":"Record","title":"Record","text":"julia> records = [record for _ in 1:10];\n\njulia> CounterTools.aggregate.(diff(records))\n9-element Array{Tuple{Int64,Int64},1}:\n (0, 0)\n (0, 0)\n (0, 0)\n (0, 0)\n (0, 0)\n (0, 0)\n (0, 0)\n (0, 0)\n (0, 0)","category":"page"},{"location":"records/#Record-Docstrings-1","page":"Record","title":"Record Docstrings","text":"","category":"section"},{"location":"records/#","page":"Record","title":"Record","text":"CounterTools.Record\nCounterTools.aggregate\nCounterTools.mapleaves\nCounterTools.CounterValue","category":"page"},{"location":"records/#CounterTools.Record","page":"Record","title":"CounterTools.Record","text":"Record{name}(data::T) where {T <: Union{Vector, NTuple}}\n\nCreate a named Record around data. The elements of data may themselves be Records, resulting in a hierarchical data structure.\n\n\n\n\n\n","category":"type"},{"location":"records/#CounterTools.aggregate","page":"Record","title":"CounterTools.aggregate","text":"aggregate(record::Record)\naggregate(f, record::Record)\n\nReduce over all the leaf (terminal) elements of record, applying f as the reduction function. If f is not supplied, it will defult to (x,y) -> x .+ y.\n\n\n\n\n\n","category":"function"},{"location":"records/#CounterTools.mapleaves","page":"Record","title":"CounterTools.mapleaves","text":"mapleaves(f, record::Record) -> Record\n\nApply f to each leaf element of record. This will recursively descend through hierarchies of Records and only apply f to scalars.\n\nThe returned result will have the same hierarchical structure as record\n\n\n\n\n\n","category":"function"},{"location":"records/#CounterTools.CounterValue","page":"Record","title":"CounterTools.CounterValue","text":"CounterValue(x::UInt)\n\nA raw value returned from a performance counter. This type will automatically detect and correct for counter roll-over.\n\njulia> a = CounterTools.CounterValue(0x0)\nCV(0)\n\njulia> b = CounterTools.CounterValue(0x1)\nCV(1)\n\njulia> b - a\n1\n\njulia> UInt(a - b)\n0x00007fffffffffff\n\n\n\n\n\n","category":"type"},{"location":"dev/pmu/#The-PMU-Interface-1","page":"The PMU Interface","title":"The PMU Interface","text":"","category":"section"},{"location":"counters/#Counter-Resources-1","page":"Counter Resources","title":"Counter Resources","text":"","category":"section"},{"location":"counters/#","page":"Counter Resources","title":"Counter Resources","text":"Finding information on performance counters is not too hard once you know where to look. The site","category":"page"},{"location":"counters/#","page":"Counter Resources","title":"Counter Resources","text":"https://download.01.org/perfmon","category":"page"},{"location":"counters/#","page":"Counter Resources","title":"Counter Resources","text":"has event codes and umasks for both core and uncore counters for all Intel architectures, and is a great reference.","category":"page"},{"location":"counters/#","page":"Counter Resources","title":"Counter Resources","text":"Documentation regarding Core counters can be found in Chapters 18 and 19 of the Software Developers Manual (Volume 3B):","category":"page"},{"location":"counters/#","page":"Counter Resources","title":"Counter Resources","text":"https://software.intel.com/en-us/download/intel-64-and-ia-32-architectures-sdm-volume-3b-system-programming-guide-part-2","category":"page"},{"location":"counters/#","page":"Counter Resources","title":"Counter Resources","text":"Finally, documentation regarding Uncore counters can be found in the Intel® Xeon® Processor Scalable Memory Family Uncore Performance Monitoring:","category":"page"},{"location":"counters/#","page":"Counter Resources","title":"Counter Resources","text":"https://software.intel.com/en-us/download/intel-xeon-processor-scalable-memory-family-uncore-performance-monitoring-reference-manual","category":"page"},{"location":"#CounterTools-1","page":"Getting Started","title":"CounterTools","text":"","category":"section"},{"location":"#Indexing-1","page":"Getting Started","title":"Indexing","text":"","category":"section"},{"location":"#","page":"Getting Started","title":"Getting Started","text":"Many hadware values start at 0 (zero) while Julia's indexing is Index 1. To make this distinction clear, CounterTools implements an CounterTools.IndexZero type. The semantics of Integers in CounterTools is thus:","category":"page"},{"location":"#","page":"Getting Started","title":"Getting Started","text":"A regular Integer will be interpreted as Index 1.","category":"page"},{"location":"#","page":"Getting Started","title":"Getting Started","text":"Therefore, if your system has 8 cpus, these will be numbered 1, 2, ..., 8.","category":"page"},{"location":"#","page":"Getting Started","title":"Getting Started","text":"An IndexZero value will be interpreted as literally starting at 0.","category":"page"},{"location":"#","page":"Getting Started","title":"Getting Started","text":"Therefore, reference CPU 0 could be referred to as either the Integer 1, or CounterTools.IndexZero(0).","category":"page"},{"location":"#","page":"Getting Started","title":"Getting Started","text":"CounterTools.IndexZero\nCounterTools.value","category":"page"},{"location":"#CounterTools.IndexZero","page":"Getting Started","title":"CounterTools.IndexZero","text":"IndexZero\n\nSpecify that the value contained should be interpreted as starting at zero (0).\n\nFor example,\n\nconvert(CounterTools.IndexZero, 1) == CounterTools.IndexZero(0)\n\n\n\n\n\n","category":"type"},{"location":"#CounterTools.value","page":"Getting Started","title":"CounterTools.value","text":"value(x::IndexZero)\n\nReturn the Integer value of x.\n\n\n\n\n\n","category":"function"}]
}

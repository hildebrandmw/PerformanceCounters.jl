module CounterTools

using Libdl

const SRCDIR = @__DIR__
const PKGDIR = dirname(SRCDIR)
const DEPSDIR = joinpath(PKGDIR, "deps")

include("indexzero.jl")
include("affinity.jl")
include("core/core.jl")

function program(cpu, counter, event, umask)
    # Construct the event select register contents for this event and umask
    #
    # usr = true: Allow capturing of counters in user mode
    # os = true: Allow capturing of counters in privileged mode
    # en = true: Actually enable the counters
    reg = EventSelectRegister(;
        event = event,
        umask = umask,
        usr = true,
        os = true,
        en = true,
    )

    return program(cpu, counter, reg)
end

function program(cpu, counter, reg::EventSelectRegister)
    writemsr(cpu, EVENT_SELECT_MSRS[counter], reg)
    return nothing
end

end # module
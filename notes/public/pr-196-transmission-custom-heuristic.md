# PR #196 — transmissionCustom heuristic note

`getSetupState` in `src/bootstrap.ts` marks a config as `ready` only if the
Transmission URL differs from the default (`http://localhost:9091/transmission/rpc`).

The intent is to detect whether the operator actually configured Transmission.
The failure case: an operator running Transmission locally on the default port
(a valid, common NAS setup) is permanently stuck at `partially_configured` despite
being fully operational. The banner reads "Setup incomplete" forever.

Assessed as **low risk** for now — installing Transmission on a Synology NAS is
not straightforward (not a supported package out of the box), so local-default
collisions are unlikely in practice.

If the heuristic needs fixing later, the right move is to drop `transmissionCustom`
from the `ready` check entirely. Non-empty feeds + non-empty TV shows is sufficient
evidence of real operator intent. The URL tells you nothing about whether someone
configured the system.

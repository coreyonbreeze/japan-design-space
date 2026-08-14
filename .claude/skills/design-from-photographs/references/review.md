# Reviewing the work

Two habits catch almost everything: look at the rendered result, and ask someone to attack it.

## Look at it

Visual work cannot be judged from source. Render it, screenshot it, and examine the screenshot at full size. Thumbnails hide the defects that matter — overlapping labels, muddy fills, text that vanishes against its background.

Check every combination you built. Theming bugs live in the pairing nobody opened: a surface that reads correctly in one mode and turns to mud in another, or a color that only fails when two modes are active at once.

Watch the motion rather than reading the code. Passive effects run after paint, so a transition can look correct in source and still flash the wrong frame. Take two screenshots a few hundred milliseconds apart during a transition: if the value jumped rather than progressed, it is not interpolating.

## Ask for attacks, not opinions

A reviewer asked "how does this look?" will say it looks good. Give them a specific brief and permission to be blunt.

Two useful lenses, run separately:

**Craft.** Is anything rushed, mushy, or dead? Where does something start or stop with no wind-up or follow-through? Does anything move as one rigid block that should be layered? Name the constant and the value you would use instead — "it could be smoother" is useless.

**Correctness.** Trace the state. What happens on a double trigger, on a mid-flight interruption, on unmount? Are timers and animation frames cleaned up? Does an effect depend on state it sets itself, so it cancels its own work? Which values are hardcoded and will break in another mode? Mark each finding as traced or suspected.

Have reviewers report findings only, without editing. You want the diagnosis separate from the fix so you can judge each one.

## Verify the fix, do not assume it

After a fix, look again. Two failure modes recur:

- **Stale build.** You are looking at the previous bundle and concluding the fix failed, or worse, that it worked. Force a fresh load before judging.
- **The fix moved the bug.** Removing metadata to protect privacy can rotate photographs, because orientation lived in that metadata. Fixing an overlay's timing can expose a different frame. Re-check the neighbouring behaviour, not just the reported symptom.

## Report honestly

When something is unverified, say so. When a fix is partial, say which part. A review that reports three real problems is worth more than one that reports none, and the user cannot calibrate their trust if problems arrive silently pre-solved.

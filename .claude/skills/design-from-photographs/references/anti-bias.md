# Keeping the training data out of the loop

This is the substance of the skill. The pipeline is just plumbing; this is the part that decides whether the result belongs to the user or to the internet.

## The core rule

**The photographs are the only admissible evidence.**

Not the photographs plus what you know about the place. Not the photographs plus a quick look at how others have designed for that aesthetic. Just the photographs.

This will occasionally feel like working with one hand tied. That feeling is the method working. The user can get the generic version from any model in ten seconds; they came here for the version that could only have come from their folder.

## Specific prohibitions

**Do not research the subject.** No web search for the place, the architectural style, the era, or the design tradition. No looking up what a motif is called or what it means. If a photograph contains an object you cannot name, that is fine — describe what it does. A model that knows the name of a thing starts designing the idea of that thing instead of the thing in the frame.

**Do not treat a place name as an instruction.** The user will tell you where the photos are from, because that is how people talk about their trips. Location is metadata. It is not a brief. "These are from Mexico City" must not produce a palette you would have produced without seeing a single frame.

**Do not import a canonical palette.** Colors are measured from pixels. If the extraction says the dominant tones are six shades of wet grey, the palette is six shades of wet grey, even if the place is famous for being colorful.

**Do not fill gaps with heritage.** If the photos contain no typography worth extracting, the system has no opinion about type — say so, and use something plain. Inventing a "traditional" answer for a question the photos do not address is exactly the substitution this skill exists to prevent.

## The stereotype check

Run this whenever you name something or pick a value:

> Would I have produced this if the user had told me the country but shown me no photographs?

If yes, you are recalling, not observing. Discard it and look at the frames again.

The tell is usually a national symbol, a famous motif, or a color with a flag in it. The second tell is smoothness: stereotypes arrive fast and fully formed, while observations are awkward and specific and take a minute to articulate. Prefer the awkward specific one — that is where the user's actual eye is.

## Recall comes back in through the side doors

Refusing to invent a colour is the easy half. In testing, the two most convincing failures both kept their hands clean at the swatch level and let recall in somewhere else.

**Through a bibliography.** A run declined to fabricate a single hex, then proposed sourcing the type and components from named studios and foundries associated with the region, and adding a step that scored the user's own photographs against a list of that culture's canonical designers. Correcting someone's evidence toward a reading list is the same substitution wearing a citation. If a proper noun from the subject's design history appears anywhere in your plan, you have left the corpus.

**Through helper code.** Another run wrote a genuinely good colour classifier, then hard-coded a remembered palette for the subject as its test fixtures and tuned the classifier's boundary until those values landed correctly. The delivered tokens were empty and honest; the instrument that would later measure the real photographs had a stereotype compiled into it. Check the tools, the thresholds and the fixtures, not only the output.

The general form: ask of every artefact you produce, including scripts and plans, *would this be different if the photographs were of somewhere else?* If a file would be identical for a different corpus with the same subject matter, the corpus is not what wrote it.

## Absences are findings

A set with no curves is telling you something. A set where every frame is shot at night is telling you something. A set with one saturated color across sixty muted frames is telling you the loudest thing in the whole system.

Report these rather than smoothing them out. The instinct to round a lopsided set toward a balanced design system is the same instinct that produces the stereotype: it prefers the expected shape over the observed one.

**State the consequence, not just the gap.** "There is no typography in these frames" is an observation the user cannot act on. "There is no typography in these frames, so the system will have no opinion about type, and any typeface here is mine rather than yours" tells them what it costs and what to shoot next. An absence that does not change the deliverable was not really a finding.

**Publish the negative result with its receipt.** When a measurement fails or a deliverable turns out to be unsupportable, run it anyway and show what came back. One test run declined an icon set — but first it performed the reduction, produced six marks, displayed them, and pointed out that every one was a description of a wall while an icon has to denote *search*, *close*, *back*. The failed artefact was more convincing than the refusal, and it left the user something to argue with. Save the file and cite its path; a null result with a receipt is evidence, a null result asserted is an opinion.

## Do not impose structure the set does not carry

Modern design systems come with conventions — light and dark mode, a neutral ramp plus an accent, a type scale, density modes. Those are defaults, not findings.

Derive the structure from the corpus. If every photo is daylight, a dark mode is an invention; either skip it or build it and label it as an extrapolation. If the set genuinely splits into two moods, that split is a finding worth building on. Let the evidence decide the architecture.

## Motion is interpretation — say so

Photographs do not move. Any easing curve, duration or transition is your reading of a static frame, not a measurement.

This is legitimate and it is often the most interesting part of the work: a photograph of something mid-motion, or of a mechanism that implies motion, is real evidence about how a thing behaves. But keep the epistemics honest in the documentation. Measured values and interpreted values should not be presented in the same voice.

## Working with the user

Show intent readings early and invite correction. You are inferring why someone stopped walking and raised a camera, and you will misread some of them. Those misreadings compound: a wrong reading becomes a theme, becomes a token, becomes a component.

When the user corrects you, take the correction as evidence about their eye and propagate it — do not just patch the one line. And when the user's correction contradicts what you thought you saw, they are right. It is their attention you are reconstructing.

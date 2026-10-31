// The cliche lexicon. Compiled from patterns seen across 300+ higher ed audits.
// Voice rules: deadpan, accurate, mean to the copy and never to the reader. No em dashes.
// Severity: 1 = filler, 2 = generic claim, 3 = terminal (shows up on every site in America).

const H = '[- ]'; // hyphen or space: "world-class" and "world class"

function entry(id, phrase, patterns, translation, fix, severity) {
  return {
    id,
    phrase,
    patterns: patterns.map((p) => new RegExp(p.source, 'gi')),
    translation,
    fix,
    severity,
  };
}

const r = (s) => new RegExp(s); // for patterns that interpolate H

export const LEXICON = [
  // ---------- Severity 3: terminal ----------
  entry('prepare-future', 'prepare you for the future', [
    /\bprepar(?:e|es|ed|ing)\s+(?:you|students|our students|graduates|them|you|learners)?\s*(?:to (?:lead|succeed|thrive) in|for) (?:the|your|their) futures?\b/,
    /\bprepared for (?:the|your|what'?s) (?:future|next)\b/,
    r(`\\bfuture${H}ready\\b`),
  ], 'The future will happen. You will be in it.',
  'Name the job, the employer, and the year a graduate got it.', 3),

  entry('leaders-of-tomorrow', 'leaders of tomorrow', [
    /\b(?:leaders|thinkers|innovators|changemakers|change-makers|problem-solvers) of tomorrow\b/,
    /\btomorrow'?s (?:leaders|innovators|thinkers|changemakers)\b/,
    /\bnext generation of (?:leaders|innovators|thinkers|scholars|changemakers)\b/,
    /\bfuture leaders\b/,
    /\bwhere leaders (?:begin|are made|are born|start)\b/,
  ], 'Our students are young.',
  'Name one alum, the thing they lead now, and the year they started.', 3),

  entry('world-class', 'world-class', [
    r(`\\bworld${H}class\\b`),
  ], 'Nobody ranked us for this.',
  'Name the ranking, the year, and the place. Or delete it.', 3),

  entry('vibrant-community', 'vibrant community', [
    /\bvibrant (?:campus |student |learning |academic |intellectual |residential )?(?:community|communities|campus life|campus|culture|atmosphere|environment|student life|city)\b/,
  ], 'There are people here.',
  'Name the club, the night, the headcount.', 3),

  entry('hands-on', 'hands-on learning', [
    r(`\\bhands${H}on (?:learning|experiences?|education|approach|opportunities|training|research|projects?)\\b`),
    /\bexperiential learning\b/,
    /\blearning by doing\b/,
  ], 'Students will touch things.',
  'Name the thing they touch, where it is, and which semester they get to.', 3),

  entry('cutting-edge', 'cutting-edge', [
    r(`\\b(?:cutting|leading|bleeding)${H}edge\\b`),
  ], 'We bought something after 2015.',
  'Name the equipment, the room it lives in, and the course that uses it.', 3),

  entry('state-of-the-art', 'state-of-the-art facilities', [
    r(`\\bstate${H}of${H}the${H}art(?: (?:facilities|facility|labs?|laboratories|equipment|technology|buildings?|centers?|campus|classrooms?))?\\b`),
  ], 'We have buildings. Some are new.',
  'Name the building, the year it opened, and one thing you can only do inside it.', 3),

  entry('tradition-of-excellence', 'tradition of excellence', [
    /\b(?:long |proud |rich |storied )?(?:tradition|legacy|history|heritage|culture) of (?:academic )?excellence\b/,
  ], 'We are old.',
  'Give the founding year and one strange thing you have done every year since.', 3),

  entry('transform-your-world', 'transform your world', [
    /\btransform (?:your|the|their|our) (?:world|life|lives|future|communities)\b/,
    /\btransformative (?:experience|education|learning|journey|years?)\b/,
    r(`\\blife${H}(?:changing|transforming) (?:experience|education|opportunit(?:y|ies)|journey)\\b`),
  ], 'Something will be different afterward.',
  'Show one before and one after. Name the student in both.', 3),

  entry('discover-your-passion', 'discover your passion', [
    /\b(?:discover|find|follow|pursue|ignite|fuel|explore|uncover|turn) (?:your|their) (?:passions?|purpose|calling|curiosity)(?: into (?:a )?(?:career|purpose|profession))?\b/,
  ], 'You do not know what you want. Same.',
  'Name the class where students most often switch majors, and what they switch to.', 3),

  entry('make-a-difference', 'make a difference', [
    /\bmak(?:e|es|ing) (?:a |an )?(?:real |lasting |positive |meaningful |genuine |big )?(?:difference|impact)\b/,
    /\bmak(?:e|es|ing) (?:your|their) mark\b/,
  ], 'Something, somewhere, will change.',
  'Name the difference, who made it, and the number that moved.', 3),

  entry('diverse-inclusive', 'diverse and inclusive', [
    /\bdiverse,? (?:and|&) inclusive\b/,
    /\binclusive,? (?:and|&) diverse\b/,
    /\bwelcoming,? (?:and|&) inclusive\b/,
    /\binclusive,? (?:and|&) welcoming\b/,
  ], 'There is a statement about this somewhere.',
  'Give the percentages, and name one policy that changed because of them.', 3),

  entry('endless-opportunities', 'endless opportunities', [
    /\b(?:endless|countless|limitless|unlimited|boundless|infinite|unparalleled|abundant|a wealth of|a world of|myriad|a myriad of|so many) (?:opportunities|possibilities|options|pathways|paths)\b/,
  ], 'There are some opportunities. We did not count.',
  'Count them. Then name the best three.', 3),

  entry('more-than-a-number', 'more than a number', [
    /\bmore than (?:just )?a (?:number|face in the crowd|student ID|statistic|name on a list)\b/,
    /\bnot just a (?:number|face in the crowd|statistic)\b/,
  ], 'You are a number. It is a medium-sized one.',
  'Give the median class size and the student-to-faculty ratio. Let those talk.', 3),

  entry('inside-outside-classroom', 'inside and outside the classroom', [
    /\b(?:both )?(?:inside|in) (?:and|&) (?:outside|out|beyond) (?:of )?the classroom\b/,
    /\b(?:beyond|outside) (?:of )?the classroom\b/,
  ], 'There is a classroom. There is also a not-classroom.',
  'Pick one place that is not a classroom and say what happens there on a Tuesday.', 3),

  entry('excellence', 'excellence', [
    /\bexcellence\b/,
  ], 'Good, presumably.',
  'Replace the word with the specific thing you are good at and how you know.', 2),

  // ---------- Severity 2: generic claims ----------
  entry('commitment-to-excellence', 'commitment to excellence', [
    /\b(?:commit(?:ted|ment)|dedicat(?:ed|ion)|devoted) to (?:academic )?excellence\b/,
    /\b(?:pursuit of|strive for|striving for|pursue) excellence\b/,
    /\bexcellence in (?:teaching|research|education)(?: and (?:research|teaching|service))?\b/,
  ], 'We intend to be good.',
  'Show one result. Delete the intention.', 3),

  entry('academic-excellence', 'academic excellence', [
    /\b(?:academic|educational|teaching) excellence\b/,
  ], 'Classes happen.',
  'Name a course, its enrollment cap, and who teaches it.', 2),

  entry('diverse-community', 'diverse community', [
    /\bdiverse (?:community|communities|student body|campus|population|backgrounds|perspectives|group of students)\b/,
    /\bdiversity of (?:thought|perspectives|backgrounds)\b/,
  ], 'Not everyone here is the same person.',
  'Give the numbers: first-gen share, Pell share, states, countries.', 2),

  entry('close-knit', 'close-knit community', [
    r(`\\b(?:close|tight)${H}knit(?: (?:community|campus|environment|family))?\\b`),
  ], 'It is small.',
  'Give the enrollment. Small is a number.', 2),

  entry('real-world', 'real-world experience', [
    r(`\\breal${H}world (?:experiences?|skills|learning|problems|challenges|applications?|settings?|impact|projects?)\\b`),
    r(`\\bin the real world\\b`),
  ], 'As opposed to the fake world, where classes are.',
  'Name the employer, the project, and what the student actually delivered.', 2),

  entry('global-citizens', 'global citizens', [
    /\bglobal (?:citizens?|citizenship|leaders|perspectives?|mindset|community|society)\b/,
    /\bcitizens of the world\b/,
  ], 'Some students own passports.',
  'Give the study-abroad rate and the three most common destinations.', 2),

  entry('lifelong-learners', 'lifelong learners', [
    r(`\\blife${H}?long (?:learners?|learning|love of learning|friendships?|connections)\\b`),
    /\blove of learning\b/,
  ], 'You will keep reading after you leave. Possibly.',
  'Show something alumni still do with you, with a number attached.', 2),

  entry('rigorous-academics', 'rigorous academics', [
    /\b(?:rigorous|challenging|demanding) (?:academics?|academic programs?|curriculum|curricula|coursework|education|programs?)\b/,
    /\bacademic rigou?r\b/,
  ], 'There is homework.',
  'Name the hardest required course and what happens in week three.', 2),

  entry('beautiful-campus', 'beautiful campus', [
    /\b(?:beautiful|stunning|picturesque|scenic|gorgeous|idyllic|breathtaking|historic|charming) (?:campus|setting|grounds|surroundings|location|quad)\b/,
  ], 'There are trees.',
  'Name the tree. Or the view, and from which window.', 2),

  entry('home-away-from-home', 'home away from home', [
    /\bhome away from home\b/,
    /\bsecond home\b/,
    /\bfeels? (?:right )?at home\b/,
  ], 'There are beds.',
  'Describe one residence hall by name: room size, the view, what happens in the lounge.', 2),

  entry('find-your-place', 'find your place', [
    /\bfind (?:your|their) (?:place|people|home|fit|voice|path|way|tribe)\b/,
    /\bwhere you belong\b/,
    /\byou belong here\b/,
  ], 'Other people also go here.',
  'Name three groups a new student could join in week one, with headcounts.', 2),

  entry('unlock-potential', 'unlock your potential', [
    /\b(?:unlock|unleash|reach|realize|achieve|fulfill|discover|maximize) (?:your|their|his or her|every student's) (?:full |true |highest )?potential\b/,
  ], 'You have potential. We have tuition.',
  'Show one graduate and what they did. Potential is not an outcome.', 2),

  entry('dedicated-faculty', 'dedicated faculty', [
    /\b(?:dedicated|caring|committed|passionate|talented|distinguished|accomplished|expert|outstanding|exceptional|engaged|experienced|supportive) (?:faculty|professors|teachers|instructors|educators|faculty members|mentors|scholars)\b/,
  ], 'Professors show up.',
  'Name one professor and one thing they did with an undergraduate this year.', 2),

  entry('faculty-know-you', 'faculty who know your name', [
    /\bfaculty (?:who|that) (?:care|are invested|know (?:you|your name))\b/,
    /\bknow (?:you|your name|you by name)\b/,
  ], 'Someone will learn your name eventually.',
  'Give the median class size, then name a professor who does something unusual with it.', 2),

  entry('personalized-attention', 'personalized attention', [
    r(`\\b(?:personali[sz]ed|individuali[sz]ed|individual|one${H}on${H}one) (?:attention|support|education|experience|learning|mentoring|mentorship|advising|instruction)\\b`),
  ], 'There is an advisor.',
  'Say how many students each advisor has.', 2),

  entry('student-centered', 'student-centered', [
    r(`\\bstudent${H}(?:centered|centred|focused|first)\\b`),
  ], 'Students are present.',
  'Name a decision students changed this year.', 2),

  entry('opportunities-to-grow', 'opportunities to grow', [
    /\b(?:opportunit(?:y|ies)|room|chances?) to (?:grow|learn and grow|thrive|explore|succeed|lead)\b/,
    /\bgrow (?:personally|intellectually|academically) and (?:professionally|personally|intellectually|socially)\b/,
  ], 'Time passes. You will be older.',
  'Name something a junior can do that a first-year cannot, and where.', 2),

  entry('student-success', 'student success', [
    /\b(?:student|your|future|lifelong|long-term) success\b/,
    /\bsucceed in (?:a|an|today's|the) (?:changing|global|complex|ever-changing|competitive|modern) (?:world|economy|society|workforce)\b/,
  ], 'Things will go well. Probably.',
  'Give the graduation rate, the outcomes rate, and where those numbers came from.', 2),

  entry('changing-world', 'an ever-changing world', [
    r(`\\b(?:ever${H}changing|rapidly changing|fast${H}changing|changing|complex|interconnected|increasingly global|globali[sz]ed|modern) world\\b`),
    /\btoday'?s (?:world|global economy|workforce|society|economy)\b/,
  ], 'It is currently the present.',
  'Name the specific change you are responding to and the course that responds to it.', 2),

  entry('nurturing-environment', 'supportive environment', [
    /\b(?:nurturing|supportive|welcoming|caring|inclusive|collaborative|safe|engaging|stimulating) (?:learning )?(?:environment|atmosphere|campus|culture|setting|space)\b/,
  ], 'Nobody is mean to you on the website.',
  'Name the support office, its hours, and how fast it answers an email.', 2),

  entry('world-renowned', 'world-renowned', [
    r(`\\b(?:world|internationally|nationally|globally)${H}(?:renowned|recognized|known|acclaimed)\\b`),
    r(`\\baward${H}winning\\b`),
    /\brenowned\b/,
  ], 'Someone, somewhere, has heard of us.',
  'Name the award, the year, and the person who won it.', 2),

  entry('top-ranked', 'top-ranked', [
    r(`\\b(?:top${H}ranked|highly${H}ranked|top${H}tier|top${H}notch|first${H}rate|second to none)\\b`),
    /\b(?:a|the|our) (?:leading|premier|preeminent|pre-eminent) (?:institution|university|college|school|destination|provider)\b/,
  ], 'We are on a list. Possibly.',
  'Name the list, the year, and the rank. If you cannot, cut it.', 2),

  entry('one-of-the-best', 'one of the best', [
    /\bone of the (?:best|finest|top|leading|most (?:respected|innovative|prestigious|beautiful|diverse))\b/,
    /\bamong the (?:best|finest|top)\b/,
  ], 'We are in the top several hundred.',
  'Cite the ranking, or replace with the one thing you are actually first at.', 2),

  entry('like-no-other', 'like no other', [
    /\blike no other\b/,
    /\blike nowhere else\b/,
    /\bunlike any other\b/,
  ], 'Like several others.',
  'Name the thing. If a rival also has it, pick another thing.', 2),

  entry('rich-history', 'rich history', [
    /\b(?:rich|storied|proud|long|distinguished) (?:history|heritage|tradition|legacy)\b/,
  ], 'We have been here a while.',
  'Give the year, and one odd thing that has survived since.', 2),

  entry('sense-of-community', 'sense of community', [
    /\b(?:strong |true |real |deep |genuine )?sense of (?:community|belonging|purpose|place)\b/,
  ], 'People say hello. Some of them.',
  'Name the ritual: when it happens, where, and how many show up.', 2),

  entry('small-classes', 'small class sizes', [
    /\bsmall class(?:es| sizes?)\b/,
    r(`\\blow student${H}to${H}faculty ratio\\b`),
  ], 'The rooms are not huge.',
  'Give the median class size and the ratio. Numbers, not adjectives.', 2),

  entry('career-ready', 'career-ready', [
    r(`\\bcareer${H}(?:ready|readiness|focused|oriented)\\b`),
    /\bready for (?:the|your) (?:career|workforce|real world|workplace)\b/,
    /\bjobs of (?:tomorrow|the future)\b/,
  ], 'You will need a job.',
  'Give the six-month outcomes rate and five employers by name.', 2),

  entry('engaged-citizens', 'engaged citizens', [
    /\b(?:engaged|responsible|informed|ethical|thoughtful) (?:citizens|leaders|members of society)\b/,
  ], 'Graduates may vote.',
  'Name the program and what students did in the actual town.', 2),

  entry('greater-good', 'the greater good', [
    /\b(?:the )?(?:greater|common|public) good\b/,
    /\bserv(?:e|ing) (?:others|society|humanity|the world)\b/,
  ], 'We mean well.',
  'Count the hours, name the partner, say what changed.', 2),

  entry('part-of-something', 'part of something bigger', [
    /\bpart of something (?:bigger|greater|larger|special)\b/,
    /\bpart of (?:the|our) [\w-]+ family\b/,
  ], 'There are other people. Some of them donate.',
  'Name one alum-to-student connection that actually happened, and what came of it.', 2),

  entry('forefront', 'at the forefront', [
    /\b(?:at the )?forefront of\b/,
    /\b(?:leading|paving) the way\b/,
  ], 'We are near the front. Of something.',
  'Name the first thing you did that others copied, with the year.', 2),

  entry('pushing-boundaries', 'pushing boundaries', [
    /\bpush(?:ing|es)? (?:the )?boundaries\b/,
    /\bbreak(?:s|ing)? new ground\b/,
    r(`\\bground${H}?breaking\\b`),
    /\btrailblaz(?:ing|ers?)\b/,
  ], 'Research occurs.',
  'Name the finding, the journal, and the undergraduate on the paper.', 2),

  entry('wide-range', 'a wide range of', [
    /\b(?:a |an )?(?:wide|broad|diverse|vast|rich|impressive|extensive) (?:range|array|variety|selection|spectrum|assortment) of\b/,
  ], 'We have a list.',
  'Give the number, then name the two strangest things on it.', 2),

  entry('high-quality', 'high-quality education', [
    r(`\\bhigh${H}quality\\b`),
    /\bquality (?:education|programs?|instruction)\b/,
  ], 'It is not bad.',
  'Show the evidence of quality: an outcome, a rank, or a named result.', 2),

  entry('exceptional-value', 'exceptional value', [
    /\b(?:exceptional|outstanding|great|incredible|tremendous|unbeatable|excellent) value\b/,
    /\baffordable excellence\b/,
  ], 'It costs money, but less than somewhere.',
  'Give the average net price after aid. That is the sentence.', 2),

  entry('committed-to-providing', 'committed to providing', [
    /\b(?:committed|dedicated|devoted) to (?:providing|helping|ensuring|fostering|creating|supporting|empowering|preparing|offering|delivering|serving)\b/,
  ], 'We plan to.',
  'Delete the commitment. State what you provide and to how many people.', 2),

  entry('shape-the-future', 'shape the future', [
    /\bshap(?:e|es|ing) (?:the|tomorrow's|a better|our) (?:future|world)\b/,
    /\bchang(?:e|ing) the world\b/,
    /\bbuild(?:ing)? a better (?:world|future|tomorrow)\b/,
  ], 'The future will have a shape.',
  'Name the problem, the person working on it, and how far they got.', 2),

  entry('starts-here', 'your story starts here', [
    /\byour (?:story|future|journey|adventure|success) (?:starts|begins) (?:here|now|today)\b/,
    /\b(?:it all )?(?:starts|begins) here\b/,
  ], 'This is the first page.',
  'Show the first thing that happens after you enroll, with a date.', 2),

  entry('unique', 'unique', [
    /\b(?:truly )?unique(?:ly)?\b/,
  ], 'Like the others, but we said unique.',
  'Name what no peer has, then check that they really do not.', 2),

  entry('innovative', 'innovative', [
    /\binnovat(?:ive|ion|ions)\b/,
  ], 'We changed something once.',
  'Name the new thing, the year it started, and what it replaced.', 2),

  entry('where-x-meets-y', 'where tradition meets innovation', [
    /\bwhere (?:tradition|history|the past|excellence|innovation|theory|learning|passion|curiosity|purpose|ambition|faith|creativity) meets\b/,
  ], 'Two abstract nouns are in a room.',
  'Replace both nouns with a person and a place.', 2),

  entry('unforgettable-experience', 'an unforgettable experience', [
    r(`\\b(?:unforgettable|memorable|once${H}in${H}a${H}lifetime|one${H}of${H}a${H}kind|enriching|rewarding|meaningful) (?:college )?(?:experiences?|journey)\\b`),
  ], 'Something will happen to you.',
  'Describe the thing that will happen: who, where, and which weekend.', 2),

  entry('academic-journey', 'your academic journey', [
    /\b(?:academic|educational|college|learning|intellectual) journey\b/,
  ], 'School.',
  'Replace with the actual sequence: what happens first year, what happens senior year.', 2),

  // ---------- Severity 1: filler ----------
  entry('holistic', 'holistic', [
    /\bholistic(?:ally)?\b/,
    /\bwhole (?:person|student|self)\b/,
  ], 'We also care about the parts of you that do not take exams.',
  'Name the program that serves the non-academic part, and how many students use it.', 1),

  entry('interdisciplinary', 'interdisciplinary', [
    /\b(?:inter|multi|cross|trans)-?disciplinary(?: (?:approach|learning|education|programs?|opportunities|studies|perspectives?|research|collaboration))?\b(?![^.!?]{0,40}\b(?:between|combining|that (?:pairs|combines|joins))\b)/,
  ], 'Two departments have met.',
  'Name the two disciplines and the course where they collide.', 1),

  entry('thrive', 'thrive', [
    /\bthriv(?:e|es|ing)\b/,
  ], 'You will be fine.',
  'Say what thriving looks like here in numbers: retention, graduation, a named outcome.', 1),

  entry('empower', 'empower', [
    /\bempower(?:s|ed|ing|ment)?\b/,
  ], 'We will allow it.',
  'Say what students actually get to decide, with one example.', 1),

  entry('foster', 'foster', [
    /\bfoster(?:s|ed|ing)?\b/,
  ], 'We would like it to happen.',
  'Name the program that does it and how many students it reached last year.', 1),

  entry('well-rounded', 'well-rounded', [
    r(`\\bwell${H}rounded\\b`),
  ], 'There are electives.',
  'Name the strangest required course.', 1),

  entry('critical-thinking', 'critical thinking', [
    r(`\\bcritical(?:ly)?${H}think(?:ing|ers?)\\b`),
    /\bthink critically\b/,
  ], 'Students will have opinions.',
  'Show one real assignment prompt. Let readers judge the thinking.', 1),

  entry('problem-solvers', 'problem-solvers', [
    r(`\\b(?:creative |innovative )?problem${H}solvers?\\b`),
  ], 'Graduates will be employable, we hope.',
  'Name a problem a student solved and who had the problem.', 1),

  entry('unparalleled', 'unparalleled', [
    /\b(?:unparalleled|unmatched|unrivaled|unrivalled|unsurpassed|exceptional|extraordinary|outstanding|unprecedented|incomparable)\b/,
  ], 'Same as everyone, said louder.',
  'Swap the adjective for the fact that made you reach for it.', 1),

  entry('learning-community', 'learning community', [
    /\b(?:learning|academic|intellectual|scholarly|caring|supportive|inclusive|welcoming) communit(?:y|ies)\b/,
  ], 'School is held here.',
  'Name the reading group, the lab meeting, or the late-night thing, and when.', 1),

  entry('heart-of', 'in the heart of', [
    /\b(?:at|in) the heart of\b/,
  ], 'A location, said romantically.',
  'Give the real geography: which street, how many minutes from what.', 1),

  entry('gateway', 'a gateway to', [
    /\bgateway to\b/,
    r(`\\blaunch${H}?pad\\b`),
    /\bspringboard\b/,
  ], 'You will leave eventually.',
  'Name where graduates actually went, by employer or program.', 1),

  entry('sky-is-the-limit', 'the sky is the limit', [
    /\bthe sky'?s the limit\b/,
    /\bthe sky is the limit\b/,
    /\bno limits\b/,
    /\banything is possible\b/,
    /\bdream big\b/,
  ], 'Results not guaranteed.',
  'Replace with one thing a student actually did.', 1),

  entry('bright-future', 'a bright future', [
    /\bbright(?:er)? futures?\b/,
  ], 'Nothing bad will happen. Probably.',
  'Give a median salary or a named outcome instead of a weather report.', 1),

  entry('dynamic', 'dynamic', [
    /\bdynamic\b/,
  ], 'Things move.',
  'Say what changed this year.', 1),

  entry('robust', 'robust', [
    /\brobust\b/,
  ], 'There is a lot of it, we think.',
  'Count it.', 1),

  entry('comprehensive', 'comprehensive', [
    /\bcomprehensive\b/,
  ], 'We have many things.',
  'Give the count, then name the one program people cross the country for.', 1),

  entry('passionate-about', 'passionate about', [
    /\bpassionate (?:about|for)\b/,
  ], 'They like it.',
  'Show what the passion produced: a project, a result, a date.', 1),

  entry('join-us', 'join our community', [
    /\bjoin (?:us|our community|the [\w-]+ family|a community|our family)\b/,
  ], 'Please apply.',
  'Tell them what happens on their first day if they do.', 1),

  entry('a-place-where', 'a place where', [
    /\b(?:a|the) place where\b/,
  ], 'This is a place.',
  'Name the place. Literally: the building, the room.', 1),

  entry('tailored', 'tailored to you', [
    /\btailored to (?:your|you|each student|individual)\b/,
    /\bdesigned (?:around|with|for) you\b/,
  ], 'There are electives.',
  'Name a student whose path was unusual and what made it possible.', 1),

  entry('next-chapter', 'the next chapter', [
    /\b(?:next|new) chapter\b/,
  ], 'You are older now.',
  'Say what the first week actually looks like.', 1),

  entry('next-level', 'the next level', [
    /\bnext level\b/,
  ], 'Up.',
  'Say which level, measured how.', 1),

  entry('explore-interests', 'explore your interests', [
    /\bexplore (?:your |new |their )?(?:interests|ideas|options|possibilities)\b/,
  ], 'There is a course catalog.',
  'Name the course a first-year can take that most schools save for seniors.', 1),

  entry('the-world-is-yours', 'the world is your classroom', [
    /\bthe world (?:is|becomes) (?:yours|your classroom|waiting)\b/,
  ], 'Travel exists.',
  'Name the program, the country, and how many students went last year.', 1),

  entry('collaborative', 'collaborative', [
    /\bcollaborat(?:ive|ion)\b/,
  ], 'People work near each other.',
  'Name who collaborated with whom and what came out of it.', 1),

  entry('leader-language', 'leadership skills', [
    /\bleadership (?:skills|opportunities|development|potential)\b/,
  ], 'Someone will be put in charge of something.',
  'Name the role, the budget, or the number of people a student led.', 1),
];

export const LEXICON_INDEX = Object.fromEntries(LEXICON.map((l, i) => [l.id, i]));

export type ItemTranslation = Readonly<{
  prompt?: string;
  context?: string;
  messages?: readonly Readonly<{
    sender: string;
    text: string;
    timeLabel: string | null;
    media?: Readonly<{ alt?: string | null; fallbackText?: string | null }>;
  }>[];
  headline?: string;
  sourceLabel?: string;
  sourceName?: string;
  description?: string;
  post?: string;
  media?: Readonly<{ alt?: string | null; fallbackText?: string | null }>;
  options?: readonly Readonly<{ optionId: string; label: string; description: string }>[];
  verificationHints?: readonly string[];
  feedback?: Readonly<{
    explanation: string;
    signals: readonly string[];
    recommendation: string;
    revealedAnswer: string | null;
  }>;
}>;

const IMAGE_FALLBACK_TEXT =
  "The image is unavailable. The question remains open and the educational clues are preserved in the feedback.";

export const ENGLISH_ITEM_COPY: Record<string, ItemTranslation> = {
  "grupo-001": {
    prompt: "A supposed health remedy attributed to the WHO arrives in the family chat. Practice Stop and Investigate before someone abandons their treatment.",
    messages: [
      { sender: "Aunt Marta", text: "⚠️ URGENT family: lemon with baking soda CURES cancer, the WHO said so. Forward NOW, you could save a life 🙏🍋", timeLabel: "10:02" },
      { sender: "Cousin Luis", text: "Really? My oncologist told me to keep the treatment, but this message scared me.", timeLabel: "10:03" },
    ],
    feedback: {
      explanation: "The WHO did not confirm that remedy. Stopping the forward and then investigating the cited authority prevents a health chain from pushing a dangerous medical decision.",
      signals: [
        "Stop: urgency and “forward NOW” push you to act without thinking.",
        "Investigate: the WHO is cited, but there is no verifiable statement.",
        "A promise of a quick cure without clinical evidence or an identifiable professional.",
        "A health decision needs a health source, not a chat message.",
      ],
      recommendation: "Stop the chain, investigate on the official health channel, and tell the group what you found.",
      revealedAnswer: "It is not a WHO recommendation; stop and investigate before acting.",
    },
  },
  "grupo-002": {
    prompt: "A real photo arrives in the chat as if it showed today's flood. Stop the panic and investigate the image's context.",
    messages: [
      {
        sender: "Cousin Diego",
        text: "THIS IS WHAT THE RIVER LOOKS LIKE RIGHT NOW. It overflowed downtown; spread the word 😱",
        timeLabel: "10:14",
        media: {
          alt: "Flooded street beside a swollen river, with water covering the roadway and buildings in the background.",
          fallbackText: IMAGE_FALLBACK_TEXT,
        },
      },
      { sender: "Friend Vale", text: "Does anyone know when it was taken? My sister has to travel through that area.", timeLabel: "10:15" },
    ],
    feedback: {
      explanation: "The photo is real, but it comes from a 2016 flood. Stopping the forward and investigating origin and date prevents an old image from becoming a fake emergency.",
      signals: [
        "Stop: “right now” and panic push you to forward without checking.",
        "Investigate: there is no date, confirmed place, or photo author.",
        "A reverse image search can reveal earlier posts of the same image.",
        "A real photo does not prove that the accompanying text is also true.",
      ],
      recommendation: "Stop, reverse-search the image, and check date and place before sharing an emergency photo.",
      revealedAnswer: "The photo is real, but out of context and not from a current flood.",
    },
  },
  "grupo-003": {
    prompt: "A message offers fake UNESCO scholarships and asks for sensitive data. Stop the click and investigate the official channel.",
    messages: [
      { sender: "Unknown number", text: "🎓 UNESCO SCHOLARSHIPS 2026: 500 USD monthly for young people. LAST SPOTS TODAY. Complete the form with your ID and card in the link.", timeLabel: "10:31" },
      { sender: "Aunt Marta", text: "Could it be real? It says we lose the chance if we do not fill it out today…", timeLabel: "10:32" },
    ],
    feedback: {
      explanation: "This is phishing. Stopping the link and investigating the call on unesco.org prevents handing bank data to a fake form.",
      signals: [
        "Stop: “last spots today” and the card request push an impulsive decision.",
        "Investigate: an unknown number is not a UNESCO institutional channel.",
        "It asks for an ID and card through an unverifiable link.",
        "A real call is checked on the official domain, not in a chat.",
      ],
      recommendation: "Do not open the link or enter data; investigate on the official channel, report the message, and warn the group.",
      revealedAnswer: "The offer is phishing, not an official UNESCO scholarship call.",
    },
  },
  "grupo-004": {
    prompt: "A twelve-second political clip causes outrage. Stop the judgment and investigate the full speech.",
    messages: [
      {
        sender: "Friend Vale",
        text: "LOOK WHAT THEY SAID 😡 It is twelve seconds and I am already furious. Share it so everyone knows how they think.",
        timeLabel: "11:05",
        media: {
          alt: "Person speaking at a podium with microphones at a public event; frame from a short clip.",
          fallbackText: IMAGE_FALLBACK_TEXT,
        },
      },
      { sender: "Cousin Diego", text: "The video cuts mid-sentence and does not say who posted it. Does anyone have the full speech?", timeLabel: "11:06" },
    ],
    feedback: {
      explanation: "The clip is cut mid-sentence and changes the meaning. Stopping and investigating the full source prevents spreading an emotional montage.",
      signals: [
        "Stop: outrage from a short clip pushes sharing before thinking.",
        "Investigate: the recording source and what was said before and after are missing.",
        "A twelve-second fragment can start or end mid-sentence.",
        "Full context can completely change the interpretation.",
      ],
      recommendation: "Stop the forward, find the full speech, and compare the fragment with the original source.",
      revealedAnswer: "The clip is cut and does not show the statement's full meaning.",
    },
  },
  "grupo-005": {
    prompt: "An already verified official weather alert arrives. Investigate the source and, if it checks out, sharing can also be care.",
    messages: [
      { sender: "Uncle Carlos", text: "⚠️ OFFICIAL ALERT: Civil Protection reports a strong thunderstorm from 21:00 to 02:00. Secure windows and unplug equipment.", timeLabel: "11:20" },
      { sender: "Uncle Carlos", text: "The institutional account is verified and the notice matches the bulletin. I am sharing it so the group can prepare.", timeLabel: "11:21" },
    ],
    feedback: {
      explanation: "This alert is official. Stopping automatic skepticism and investigating the institutional account lets you share information that protects the group.",
      signals: [
        "Investigate: the responsible authority is identified and the account is verified.",
        "The notice matches an official bulletin and gives a schedule plus concrete steps.",
        "Stop the urge to doubt everything: critical thinking also confirms what is useful.",
        "A confirmed alert can be an act of care for the family.",
      ],
      recommendation: "Investigate the source and, if the alert is authentic and useful, share it with its context and concrete steps.",
      revealedAnswer: "It is a verified official alert worth sharing.",
    },
  },
  "grupo-006": {
    prompt: "A chain uses guilt and fear to demand ten forwards. Stop the pressure and investigate whether any real evidence exists.",
    messages: [
      { sender: "Anonymous chain", text: "😨 If you love your mother, forward this to 10 people. Ignore it and you will have 7 years of bad luck. It happened to a neighbor; DO NOT BREAK THE CHAIN!", timeLabel: "11:42" },
      { sender: "Aunt Marta", text: "It scared me a little… should I send it just in case?", timeLabel: "11:43" },
    ],
    feedback: {
      explanation: "The chain uses guilt and fear to replicate itself. Stopping the forward and investigating the (nonexistent) threat cuts the emotional manipulation.",
      signals: [
        "Stop: linking affection to a forwarding order is emotional pressure.",
        "Investigate: the bad-luck threat and anonymous anecdote have no evidence.",
        "It asks for a concrete number of forwards to multiply its reach.",
        "There is no real consequence for breaking a chat chain.",
      ],
      recommendation: "Stop, do not forward it, and calmly explain that it is an evidence-free emotional chain.",
      revealedAnswer: "It is an emotional chain based on guilt and fear; the responsible choice is to break it.",
    },
  },

  "real-o-ia-001": {
    prompt: "Real travel landscape or AI-generated?",
    context: "“Moraine Lake, I am not exaggerating” · 18.2k shares · uploaded 40 minutes ago.",
    media: {
      alt: "Turquoise lake between sharp mountains, a conifer forest on one side and a blue sky with clouds.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "The scene looks like a postcard that is impossible to resist. It was generated by AI: the landscape feels “too perfect” and typical model artifacts show up.",
      signals: [
        "The sky has patches and fragmented clouds that do not follow a natural shape.",
        "Saturation and contrast are pushed uniformly across the whole photo.",
        "The reflection in the water is an almost perfect mirror, with no ripples or debris.",
        "The trees along the edge look jagged and over-processed against the sky.",
      ],
      recommendation: "When a viral landscape looks “perfect”, find the location on a map and compare it with photos from real tourists before sharing it.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-002": {
    prompt: "Real field photo or AI-generated scene?",
    context: "“Every dog at the shelter went out for a run” · 9.4k likes · a story forwarded in group chats.",
    media: {
      alt: "Eight dogs of different breeds running in a line across a green meadow with a lake in the background.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It is heartwarming and looks like a news feature. It is AI: lining up so many breeds at once, all sharp and “posing” toward the camera, is a composition typical of generators.",
      signals: [
        "All the dogs are in focus at the same time, in a line that is far too orderly.",
        "The proportions between large and small breeds feel like a product catalog.",
        "The lake and hills in the background look like a clean set, with no real clutter.",
        "The shadows and the running rhythm match too closely across different animals.",
      ],
      recommendation: "If a photo of “perfect” animals goes viral, check the original account and look for similar frames with a reverse image search.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-003": {
    prompt: "Real coffee shop moment or AI-generated?",
    context: "“My favorite barista making latte art” · 6.1k shares · celebrated as the photo of the day.",
    media: {
      alt: "Barista in a green apron pouring latte art in a coffee shop with exposed brick and a specials chalkboard.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "The atmosphere feels warm and believable. It is AI: the text on the chalkboards and signs gives the model away, because it invents unreadable words.",
      signals: [
        "The specials chalkboard mixes real weekdays with meaningless words.",
        "Other signs in the background imitate letters but never form readable phrases.",
        "Some objects on the shelves melt together when you look closely.",
        "The stream of milk and the surface of the coffee look too “painted”.",
      ],
      recommendation: "When a photo of a business includes text, zoom into the signs: if they cannot be read, be suspicious before sharing.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-004": {
    prompt: "Real foodie photo or AI-generated dish?",
    context: "“Midday poke bowl” · 4.8k likes · studio light and a flawless plate.",
    media: {
      alt: "Black bowl with salmon, avocado, edamame and rice, surrounded by chopsticks and small bowls on a dark background.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It looks like restaurant advertising. It is AI: the rice and the “perfect” avocado cut are classic signs of synthetic food.",
      signals: [
        "The grains of rice look tubular and far too uniform.",
        "The avocado slices are fanned out with catalog-like symmetry.",
        "The dramatic light leaves everything glossy, with no real stains or irregularities.",
        "The edges of the fish and the seeds repeat in a pattern that is too clean.",
      ],
      recommendation: "In hyper-styled food photos, look for imperfect textures — grains, uneven highlights — before believing it is a homemade picture.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-005": {
    prompt: "Real trattoria dinner or AI-generated?",
    context: "“Dinner with nonna in Rome” · 11k shares · sentimental story attached.",
    media: {
      alt: "Smiling woman in a floral apron lifting a forkful of spaghetti in a restaurant with brick walls.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "Emotion sells the story. It is AI: the hands, the pasta, and the pictures on the back wall fall apart when you look calmly.",
      signals: [
        "The fingers of the hand resting on the table look thick or fused together.",
        "The grip on the fork does not quite match the anatomy of the hand.",
        "The spaghetti on the fork melts into a single block.",
        "The pictures in the background imitate photos or maps with no readable detail.",
      ],
      recommendation: "In viral intimate portraits, check hands and objects in contact: that is where AI failures usually appear.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-006": {
    prompt: "Real tourist street or AI-generated set?",
    context: "“The most colorful street in the world” · 22k shares · no exact location.",
    media: {
      alt: "Cobblestone street lined with houses in very bright colors under an intense blue sky.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It looks like the dream destination of any travel feed. It is AI: extreme saturation, complete emptiness, and textures that are too clean.",
      signals: [
        "The colors of the facades look like uniform neon, with no real wear.",
        "There are no cables, no people, and none of the clutter of a lived-in street.",
        "The sky is a flat blue, with no variation or visual noise.",
        "The shadows are hard and perfect, as in a render.",
      ],
      recommendation: "If a “most colorful street in the world” arrives with no verifiable location, look for geographic references before forwarding it.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-007": {
    prompt: "Real coastal photo or AI-generated?",
    context: "“Sunset at the lighthouse” · 7.3k likes · shared as a postcard from the north.",
    media: {
      alt: "White lighthouse next to red-roofed houses on dark rocks, with waves and a pink sky at sunset.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It has the air of a classic postcard. It is AI: the “catalog” composition and some textures reveal its synthetic origin.",
      signals: [
        "The scene is too clean and symmetrical for a real coast with weather.",
        "The rocks in the foreground repeat unnatural texture patterns.",
        "The lighthouse beam and the sky combine into a digital postcard glow.",
        "Fine details of the waves and the roofs are smoothed out uniformly.",
      ],
      recommendation: "Compare viral lighthouse postcards with geotagged photos of the same place: differences in texture usually give the generator away.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-008": {
    prompt: "Real advertisement or AI-generated food?",
    context: "“The best burger in the city” · 5.9k shares · a menu photo with no clear restaurant.",
    media: {
      alt: "Burger with melted cheese, tomato and lettuce on a wooden board, with fries and a drink in the background.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It looks like a professional menu photo. It is AI: the “perfectionism” of the seeds, the layers, and the highlights is far too calculated.",
      signals: [
        "The sesame seeds are spread with almost mathematical regularity.",
        "The layers of the sandwich stack with an advertising symmetry impossible in a real kitchen.",
        "The cheese falls in folds that are too clean and too repetitive.",
        "The blurred background looks like a generic digital restaurant set.",
      ],
      recommendation: "Be suspicious of “perfect” dishes with no restaurant, price, or context: look for the venue's account or a less retouched photo.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-009": {
    prompt: "Real pet portrait or AI-generated?",
    context: "“My cat's stare this morning” · 14k likes · passed around in animal groups.",
    media: {
      alt: "Close-up of a tabby cat with yellow-green eyes on a textured blanket with a blurred background.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It is impossible not to love it. It is AI: the fur and the whiskers look excessively clean, like a studio render.",
      signals: [
        "The fur has a finish that is too uniform, with no loose hairs or imperfections.",
        "The whiskers blend into the blur far too smoothly.",
        "The eyes shine with “studio” catchlights in a home setting.",
        "The bokeh background is warm and generic, with no recognizable objects.",
      ],
      recommendation: "In viral pet portraits, look at the edges of the fur and the whiskers: AI tends to smooth them out too much.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-010": {
    prompt: "Real music study or AI-generated scene?",
    context: "“Rehearsing Nocturne Op. 9 No. 2” · 3.2k shares · dark academia aesthetic.",
    media: {
      alt: "Open sheet music on a black grand piano, with a metronome and books in the background in warm light.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "The atmosphere is convincing. It is AI: it credits a Chopin nocturne to Beethoven and draws impossible musical notation.",
      signals: [
        "The score credits Nocturne Op. 9 No. 2 to Beethoven (it is by Chopin).",
        "The clefs and the notes are malformed or incomplete.",
        "The metronome shows illegible marks instead of clear numbers.",
        "Some musical symbols float or merge without following any real rules.",
      ],
      recommendation: "If an image includes sheet music, maps, or documents, check both the facts and the legibility: AI invents text that “looks real”.",
      revealedAnswer: "AI-generated",
    },
  },
  "real-o-ia-011": {
    prompt: "Real home photo or AI-generated dog?",
    context: "“The new one at home” · 890 likes · uploaded from the backyard with no filters.",
    media: {
      alt: "Golden retriever standing in a corner with white walls on a concrete floor, with its tongue out.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It feels simple and close… and it is. This is a real photo: anatomy, textures, and the wear of the surroundings all fit together.",
      signals: [
        "The fur has natural variations in color and density.",
        "The paws and their contact with the floor are anatomically coherent.",
        "The base of the wall shows real stains and wear.",
        "Natural light leaves soft shadows with no synthetic studio glow.",
      ],
      recommendation: "Not everything beautiful is fake: look for concrete inconsistencies, and if none appear, doubt is also part of good judgment.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-012": {
    prompt: "Real still life or AI-generated?",
    context: "“Fruit from the market” · 210 likes · minimalist kitchen photo.",
    media: {
      alt: "Two round fruits in a brown-olive tone on a light surface with a stone texture.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It looks too clean to be true, but it is real. The microtextures and the stem scar are not AI patterns.",
      signals: [
        "The skin shows irregular mottling, not a repeated pattern.",
        "The stem scar has believable organic detail.",
        "The shadow falls with a natural gradient that matches the light.",
        "The surface underneath has imperfections that are not symmetrical.",
      ],
      recommendation: "In minimalist photos, zoom into the small textures: AI tends to repeat patterns, while a real photo keeps its noise and irregularity.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-013": {
    prompt: "Real city view or AI-generated landscape?",
    context: "“My city in the fog” · 2.4k shares · black and white photo.",
    media: {
      alt: "Black and white view of a dense hillside neighborhood, a curved beach and tall buildings by the sea under fog.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "The urban density scares anyone hunting for AI failures… and yet it is real: the architectural chaos is coherent.",
      signals: [
        "The buildings on the hillside show chaotic variety with no repeated patterns.",
        "The geography of beach and mountain fits together as a real place.",
        "The fog and the sky have photographic gradients, not synthetic patches.",
        "There is no invented text and no structures that melt when you zoom in.",
      ],
      recommendation: "In complex panoramas, look for impossible repetition or “melted” buildings; if the chaos is coherent, it may well be authentic.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-014": {
    prompt: "Real tea room table or AI-generated?",
    context: "“Breakfast at Carette” · 1.1k likes · placemat and wrappers in view.",
    media: {
      alt: "Café table with hot chocolate, whipped cream, a silver teapot and placemats with the Carette Paris logo.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "The perfect branding raises doubts. It is real: the addresses, the typography, and the reflections in the teapot are coherent and legible.",
      signals: [
        "The text on the placemat is legible and matches a real business (Carette Paris).",
        "The wrappers show consistent typography, not scribbles.",
        "The reflections in the teapot distort the surroundings in a physically plausible way.",
        "The porcelain and the cream have believable irregular textures.",
      ],
      recommendation: "When there are logos and addresses, check whether they really exist: correct text is a strong clue of authenticity.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-015": {
    prompt: "Real Christmas portrait or AI-generated?",
    context: "“Santa at the window” · 3.6k shares · photo from a local event.",
    media: {
      alt: "Bearded man in a red Santa hat looking through a window, with a garland and blurred lights in front.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It looks like an advertising campaign. It is a real photo: skin, beard, and glass all keep their photographic texture.",
      signals: [
        "The skin shows natural pores and wrinkles around the eyes.",
        "The beard has hairs of different tones and directions.",
        "The window glass adds subtle, coherent reflections.",
        "The garland in the foreground blurs with real optical falloff.",
      ],
      recommendation: "In “campaign-style” portraits, look at the skin and the optical edges: AI tends to over-smooth or invent unreal highlights.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-016": {
    prompt: "Real street portrait or AI-generated?",
    context: "“Musician on the corner” · 640 likes · photo taken in passing.",
    media: {
      alt: "Child standing and playing a small accordion next to an orange bucket on gray tiles.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "Some details of the bucket or the instrument can be confusing, but the photo is real: the criterion is not “any oddity equals AI”.",
      signals: [
        "The posture and the weight of the body on the ground feel photographic.",
        "The clothing and the shoes show coherent textures and seams.",
        "The side light creates believable hard shadows on the pavement.",
        "Even with some confusing elements, there is no impossible anatomy and no “perfectly fake” text.",
      ],
      recommendation: "Finding one odd detail is not enough: look for a set of systematic failures (hands, text, physics) before concluding it is AI.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-017": {
    prompt: "Real musical detail or AI-generated?",
    context: "“Musical stationery gift” · 180 likes · homemade macro photo.",
    media: {
      alt: "Curved cream-colored surfaces printed with staves and musical notes, with progressive blur.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "The notation may look odd on a decorative object, but the photo is real: the optical blur and the printed paper are photographic.",
      signals: [
        "There is a sharp plane and a believable progressive optical blur.",
        "The texture of the printed paper holds up as you look closer.",
        "The curvature of the cylinders distorts the lines in a physical way.",
        "No clefs are left “floating” and there are no synthetic render highlights.",
      ],
      recommendation: "Separate the object from the photo: ask whether the capture is real, not whether the printed score is valid music.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-018": {
    prompt: "Real bright still life or AI-generated?",
    context: "“Sunday at home” · 720 likes · window light and white flowers.",
    media: {
      alt: "Dark vase with white hydrangeas on a checkered tablecloth, in front of bright windows with a blurred garden.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "The high-key light may look “AI-like”, but this is a real photo: the wood, the petals, and the reflections in the glass all behave correctly.",
      signals: [
        "The petals have irregular volume, not a cloned pattern.",
        "The vase shows coherent grooves and metallic reflections.",
        "The window frame has the imperfections of real wood.",
        "The backlight produces an optical glow, not artifact patches.",
      ],
      recommendation: "Overexposure on its own does not prove AI. Look for repeated patterns or melted edges before deciding.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-019": {
    prompt: "Real construction scene or AI-generated?",
    context: "“This is how the street looks this week” · 1.5k shares · photo from the sidewalk.",
    media: {
      alt: "Workers in reflective vests on a metal scaffold, with YODOCK barriers in the foreground.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "There are many people and a lot of metal: exactly where AI usually fails. This one is real: the harnesses, the barrier text, and the hands all check out.",
      signals: [
        "The “YODOCK” text on the barriers is sharp and correct.",
        "The harnesses and straps cross each other coherently, without melting.",
        "The hands of the worker who is pointing have believable anatomy.",
        "The blurred urban background keeps vehicles and trees recognizable.",
      ],
      recommendation: "In scenes with many people and structures, look for legible text and coherent straps and hands: that is where the difference shows.",
      revealedAnswer: "Real",
    },
  },
  "real-o-ia-020": {
    prompt: "Real garden walk or AI-generated?",
    context: "“Morning at the botanical garden” · 980 likes · photo from behind on the path.",
    media: {
      alt: "Person in a straw hat walking along a gravel path among tropical plants and palm trees.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    feedback: {
      explanation: "It looks like a travel showcase. It is real: complex foliage, imperfect gravel, and natural midday shadows.",
      signals: [
        "The leaves and the palm trees have non-repeating textures.",
        "The gravel on the path shows believable irregularities.",
        "The midday shadows are hard and consistent with the position of the sun.",
        "The human figure has plausible proportions and clothing with no deformations.",
      ],
      recommendation: "In “catalog” landscapes, look closely at the ground and the foliage: AI tends to repeat leaves or smooth out the terrain.",
      revealedAnswer: "Real",
    },
  },

  "clickbait-swipe-001": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "URGENT!! Doctors HATE this trick to lose 10 kilos in a week",
    sourceLabel: "miracle-health.xyz",
    feedback: {
      explanation: "This headline does not inform: it pushes the click. It combines urgency, capital letters, an invented authority, and an impossible promise.",
      signals: [
        "Manufactured urgency: “URGENT!!” demands immediate attention.",
        "Capital letters to shout: “HATE” looks for emotion, not data.",
        "False authority: “doctors” with no name, study, or source.",
        "Impossible promise: losing 10 kilos in a week is not verifiable news.",
      ],
      recommendation: "If a headline promises miracles or secret enemies, look for the concrete fact and a signed source before clicking.",
      revealedAnswer: "Clickbait",
    },
  },
  "clickbait-swipe-002": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "Central Bank raises the interest rate by 0.25 points because of inflation",
    sourceLabel: "economy-daily.com",
    feedback: {
      explanation: "This is journalism: an identifiable actor, an exact figure, and a cause. With no adjectives and no drama, the headline leaves you room to think.",
      signals: [
        "Who acts: the Central Bank is named.",
        "Concrete data: 0.25 points, not “a big increase”.",
        "Explicit cause: inflation connects the fact to its context.",
        "Informative tone: there are no capital letters and no manufactured urgency.",
      ],
      recommendation: "A good headline tells you what happened with enough precision for you to check it against the original source.",
      revealedAnswer: "Journalism",
    },
  },
  "clickbait-swipe-003": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "What this girl did left everyone IN SHOCK (video)",
    sourceLabel: "viral-videos.blog",
    feedback: {
      explanation: "It is a classic curiosity gap: it hides what happened so that you click. If the headline says nothing concrete, there is almost certainly nothing to report.",
      signals: [
        "Curiosity gap: “what she did” hides the essential fact.",
        "Extreme emotion: “IN SHOCK” tells you what to feel, not what happened.",
        "A promise of video with no context and no identifiable source.",
        "Zero data: there is no who, where, when, or what.",
      ],
      recommendation: "If a headline only tells you what to feel and not what happened, move on without clicking: that curiosity is the trap.",
      revealedAnswer: "Clickbait",
    },
  },
  "clickbait-swipe-004": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "City council announces road closure for works until December",
    sourceLabel: "citizen-portal.org",
    feedback: {
      explanation: "A service headline: it says who, what, and until when. Direct usefulness replaces manufactured emotion.",
      signals: [
        "Who informs: the city council is identified.",
        "What happens: a road closure because of works.",
        "Until when: the deadline runs to December.",
        "Practical usefulness: you can plan without drama.",
      ],
      recommendation: "When a headline answers who, what, and when, it was usually made to inform, not to hijack your click.",
      revealedAnswer: "Journalism",
    },
  },
  "clickbait-swipe-005": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "You will NOT BELIEVE what they found in your city's water",
    sourceLabel: "neighborhood-alert.info",
    feedback: {
      explanation: "Local fear plus vagueness: it points at “your” city without saying what was found. Fear close to home is one of the most effective baits.",
      signals: [
        "Deliberate vagueness: “what they found” hides the fact.",
        "An appeal to fear with no evidence and no figures.",
        "False personalization: “your city” fakes closeness.",
        "Impact capitals: “BELIEVE” pushes the reaction, not the verification.",
      ],
      recommendation: "Faced with a local danger warning, demand the concrete finding, the authority that measured it, and the date of the report.",
      revealedAnswer: "Clickbait",
    },
  },
  "clickbait-swipe-006": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "University study assesses air quality in 12 districts",
    sourceLabel: "news-agency.pe",
    feedback: {
      explanation: "The headline attributes the information to an identifiable study and limits its scope. You can go to the source and check it.",
      signals: [
        "Attributed source: a university study, not an anonymous rumor.",
        "Measurable scope: 12 districts.",
        "Concrete topic: air quality.",
        "No emotional bait: there are no capital letters and no personal threat.",
      ],
      recommendation: "When a headline cites a study, look for the name of the institution and the methodology summary before sharing it.",
      revealedAnswer: "Journalism",
    },
  },
  "clickbait-swipe-007": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "99% of people FAIL this intelligence test — are you in the 1%?",
    sourceLabel: "viral-tests.fun",
    feedback: {
      explanation: "It is ego bait: nobody wants to be part of the 99%. The “test” exists to keep you around ads, not to measure intelligence.",
      signals: [
        "Ego bait: the 1% invites you to feel exceptional.",
        "An invented statistic that is impossible to verify.",
        "Impact capitals: “FAIL” dramatizes without evidence.",
        "A rhetorical question that pushes the click, not the information.",
      ],
      recommendation: "If a headline dares you to prove you are special, assume the product is your attention, not the result of the test.",
      revealedAnswer: "Clickbait",
    },
  },
  "clickbait-swipe-008": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "Inflation closed the year at 3.1%, the statistics institute reported",
    sourceLabel: "reuters-agency.com",
    feedback: {
      explanation: "A figure plus a cited official source. The data speaks for itself: it needs no adjectives to be useful.",
      signals: [
        "Exact figure: 3.1% for the year.",
        "Official source cited: the statistics institute.",
        "A completed fact in the past: “closed” describes a result.",
        "No dramatization: zero capital letters and no personal threat.",
      ],
      recommendation: "Prioritize headlines that combine a figure with an official source; they are the easiest to cross-check.",
      revealedAnswer: "Journalism",
    },
  },
  "clickbait-swipe-009": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "Famous actor DESTROYS critic and the internet GOES WILD",
    sourceLabel: "celebrity-total.com",
    feedback: {
      explanation: "War verbs turn a minor argument into an epic battle. Extreme emotion replaces the fact.",
      signals: [
        "Extreme emotion: “DESTROYS” and “GOES WILD” are war verbs.",
        "Capital letters to amplify the drama.",
        "Vagueness: it does not say what the actor said or what was criticized.",
        "An appeal to collective reaction: “the internet” as a character.",
      ],
      recommendation: "If a headline sounds like combat, look for the direct quote and the context before joining the fight.",
      revealedAnswer: "Clickbait",
    },
  },
  "clickbait-swipe-010": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "Airline reports delays due to maintenance: rebooking at no cost",
    sourceLabel: "traveler-portal.net",
    feedback: {
      explanation: "Service information: what is happening, why, and what you can do about it. It is actionable and it does not dramatize.",
      signals: [
        "An operational fact: delays because of maintenance.",
        "A useful consequence: rebooking at no cost.",
        "The language of service, not of spectacle.",
        "No curiosity gap: the headline delivers the complete news.",
      ],
      recommendation: "Service headlines are usually useful journalism: keep the detail and verify it on the company's official channel.",
      revealedAnswer: "Journalism",
    },
  },
  "clickbait-swipe-011": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "This common fruit could be KILLING you slowly and you do not know it",
    sourceLabel: "health-secrets.top",
    feedback: {
      explanation: "Fear plus secrecy plus an everyday threat. Health is the favorite niche of this bait because it lowers your guard.",
      signals: [
        "Extreme fear: “KILLING you” with no evidence and no dose.",
        "A manufactured secret: “and you do not know it” fakes a revelation.",
        "An everyday threat: a common fruit cast as the enemy.",
        "Vagueness: it names neither the fruit, nor the study, nor the measurable risk.",
      ],
      recommendation: "In health, demand the name of the study, the institution, and the concrete risk; if all you get is a threat, do not click.",
      revealedAnswer: "Clickbait",
    },
  },
  "clickbait-swipe-012": {
    prompt: "Stop the click and investigate the headline. Journalism or clickbait?",
    headline: "The national team will play a friendly on September 12 at the National Stadium",
    sourceLabel: "sports-daily.com",
    feedback: {
      explanation: "Who, when, and where. It can be verified in a minute and it needs no emotion in order to be news.",
      signals: [
        "Who: the national team.",
        "When: September 12.",
        "Where: the National Stadium.",
        "A complete fact: the type of match is included (a friendly).",
      ],
      recommendation: "If a headline already answers who, when, and where, you can check it against the official schedule without falling for emotional bait.",
      revealedAnswer: "Journalism",
    },
  },

  "radar-de-fuentes-001": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "UNESCO — official site",
    description: "Article with an institutional author, a publication date, and references to official documents. Visible signals: UNESCO as author, visible date, references.",
    feedback: {
      explanation: "It is a reliable source: an international organization with an institutional domain, clear authorship, a date, and verifiable references.",
      signals: [
        "Investigate: institutional domain unesco.org with clear authorship.",
        "Trace: date and references to official documents you can check.",
        "The content is signed by the institution.",
        "The references let you return to the primary document.",
      ],
      recommendation: "When domain, author, date, and references line up, you can use it as a verifiable starting point.",
      revealedAnswer: "Reliable",
    },
  },
  "radar-de-fuentes-002": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "News agency with a signed reporter",
    description: "Wire with an identified reporter, an exact time, and a public corrections policy. Signals: signed author, timestamp, visible corrections.",
    feedback: {
      explanation: "It is reliable because agencies verify before publishing and correct in public when they get something wrong. That accountability is the key signal.",
      signals: [
        "Investigate: a reporter identified by name and role.",
        "Trace: exact time and a public corrections policy.",
        "Wire format with facts separable from opinion.",
        "A recognizable agency domain, not an improvised clone.",
      ],
      recommendation: "Investigate bylines and trace timestamps/corrections: that is how you see if a source is accountable.",
      revealedAnswer: "Reliable",
    },
  },
  "radar-de-fuentes-003": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "Article in a scientific journal with a DOI",
    description: "Study with a DOI, a described methodology, peer review, and a conflict statement. Signals: DOI, peer review, open method.",
    feedback: {
      explanation: "It is reliable: the DOI makes it traceable and peer review indicates that other experts examined it before publication.",
      signals: [
        "Investigate: DOI, open methodology, and conflict disclosure.",
        "Trace: peer review and the identifier let you locate the original.",
        "It is not a viral summary with no source.",
        "The scientific journal domain can be verified.",
      ],
      recommendation: "In science, investigate method and conflicts; trace the DOI before accepting a viral finding.",
      revealedAnswer: "Reliable",
    },
  },
  "radar-de-fuentes-004": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "Personal opinion blog",
    description: "Opinion column with no cited sources: “I tell the truth the media hide”. Signals: no sources, opinion disguised as news.",
    feedback: {
      explanation: "It is doubtful: not necessarily false, but it is opinion without evidence. It can work as a starting point, never as proof.",
      signals: [
        "Investigate: it cites no checkable sources and no editorial date.",
        "Trace: there is no documentary origin to cross-check.",
        "A personal tone that presents opinion as if it were news.",
        "It claims to reveal hidden truths without documenting them.",
      ],
      recommendation: "Separate opinion from evidence: a blog can guide your search, but it does not replace a verifiable source.",
      revealedAnswer: "Doubtful",
    },
  },
  "radar-de-fuentes-005": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "Aggregator with no author or date",
    description: "Text copied from other portals. Nobody signs it, it has no date, and it does not link to the original source. Signals: no author, no date, no links.",
    feedback: {
      explanation: "It is doubtful: with no author and no date there is nobody to hold accountable. Trace the original story before believing it.",
      signals: [
        "Investigate: no identifiable author and no publication date.",
        "Trace: it does not link to the original source of the text.",
        "The content looks reused from other portals.",
        "There is nobody to hold accountable.",
      ],
      recommendation: "If nobody signs or dates the piece, trace its origin before sharing it or using it as proof.",
      revealedAnswer: "Doubtful",
    },
  },
  "radar-de-fuentes-006": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "Satirical humor account",
    description: "Invented news written for humor. Its “About” section says so openly. Signals: satire declared.",
    feedback: {
      explanation: "It is doubtful because of satire: it does not set out to deceive, but taken out of context it circulates as real news. Always read the site's “About” page.",
      signals: [
        "Investigate: the site declares humor or satire in “About”.",
        "Trace: the origin clarifies that it invents facts for laughs, not news.",
        "Out of context it can circulate as if it were a news story.",
        "It offers no journalistic authorship and no fact corrections.",
      ],
      recommendation: "Satire is not fraud, but it is not evidence either: check the “About” page before taking it seriously.",
      revealedAnswer: "Doubtful",
    },
  },
  "radar-de-fuentes-007": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "International “scholarships” portal",
    description: "It imitates the UNESCO logo, promises money, and asks for your ID plus banking details. Signals: .xyz domain, banking data request, urgency.",
    feedback: {
      explanation: "It is fraudulent: typosquatting and phishing. The real UNESCO is unesco.org. No genuine scholarship asks for your card in order to “register”.",
      signals: [
        "Investigate: a .xyz domain that imitates a well-known brand.",
        "Trace: the real UNESCO is at unesco.org, not this form.",
        "It asks for an ID and card for a scholarship “registration”.",
        "Artificial urgency (“last spots”) typical of phishing.",
      ],
      recommendation: "Investigate the address bar and trace the official domain: unesco.org is not unesco-becas2026.premium-forms.xyz.",
      revealedAnswer: "Fraudulent",
    },
  },
  "radar-de-fuentes-008": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "Cloned newspaper",
    description: "It copies the design of a famous newspaper, but the domain is .press and every story attacks the same party. Signals: brand impersonation, total bias.",
    feedback: {
      explanation: "It is fraudulent: it impersonates a well-known brand by changing the domain. Always look at the address bar, not the logo.",
      signals: [
        "Investigate: the .press domain is not the outlet it imitates.",
        "Trace: the visual brand does not match the real editorial identity.",
        "Biased coverage that pushes a single political adversary.",
        "It offers no verifiable editorial identity of its own.",
      ],
      recommendation: "If the logo looks familiar, confirm the official domain before believing or sharing the story.",
      revealedAnswer: "Fraudulent",
    },
  },
  "radar-de-fuentes-009": {
    prompt: "Investigate the source and trace its origin. Where does it belong?",
    sourceName: "“Official True News” profile",
    description: "Account created 3 weeks ago, generic picture, posts 40 times a day, never links sources. Signals: new account, extreme volume, zero sources.",
    feedback: {
      explanation: "It is fraudulent: the pattern of a disinformation farm, with a new account, an inhuman volume of posts, and no linked sources.",
      signals: [
        "Investigate: an account created only a few weeks ago with a generic identity.",
        "Trace: it never links checkable sources; the origin is lost.",
        "Extreme volume: dozens of posts every day.",
        "A typical disinformation-farm pattern.",
      ],
      recommendation: "A new account plus inhuman volume plus zero sources is usually a disinformation farm, not a news outlet.",
      revealedAnswer: "Fraudulent",
    },
  },

  "feed-60-001": {
    prompt: "Ministry of Health: free vaccination campaign from August 5 to 12 at every health center.",
    post: "Statement with concrete dates and coverage in serious outlets.",
    sourceLabel: "minsa.gob.pe · verified account",
    verificationHints: [
      "Coverage: serious outlets report the same campaign.",
      "Original: statement on minsa.gob.pe.",
      "Concrete dates and health centers.",
    ],
    feedback: {
      explanation: "It is a useful official notice: an institutional domain, concrete dates, and coverage in serious outlets. Sharing it helps the community.",
      signals: [
        "Find better coverage: other serious outlets report the same vaccination campaign.",
        "Trace the original: the statement on minsa.gob.pe is the primary source.",
        "Institutional domain and concrete dates, with no emotional urgency.",
        "Sharing verified service information helps the community.",
      ],
      recommendation: "When the official source, the date, and the coverage all match, sharing service information is a responsible decision.",
      revealedAnswer: "Share",
    },
  },
  "feed-60-002": {
    prompt: "SCANDAL!! Celebrity DESTROYS their career in a LEAKED video. It will not stay online for long.",
    post: "No author, no date, doubtful domain. Do you amplify it?",
    sourceLabel: "celebrity-viral.top · no author or date",
    verificationHints: [
      "Coverage: no serious outlet reports it.",
      "Original: no video and no primary source.",
      "A .top domain with no authorship or date.",
    ],
    feedback: {
      explanation: "It is smoke: a doubtful domain, zero authorship, a headline that is 100% emotional, and no serious outlet reporting it. Discarding it avoids amplifying a rumor.",
      signals: [
        "Find better coverage: no serious outlet reports the supposed video.",
        "Trace the original: there is no archive, statement, or primary source.",
        "Opaque .top domain with no authorship.",
        "A 100% emotional headline that pushes the click, not the fact.",
      ],
      recommendation: "If all there is is emotion and an opaque domain, discard it before sharing.",
      revealedAnswer: "Discard",
    },
  },
  "feed-60-003": {
    prompt: "This is how the city center looks RIGHT NOW, completely flooded. Spread it.",
    post: "Striking photo forwarded by an anonymous account.",
    sourceLabel: "anonymous user · 20 min ago",
    media: {
      alt: "Urban avenue under water after a flood, with vehicles partly submerged.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    verificationHints: [
      "Coverage: no outlet reports flooding today.",
      "Original: reverse image search places the photo in 2018.",
      "The image may be real; the context is not.",
    ],
    feedback: {
      explanation: "The image may be real, but the context is false: it comes from a 2018 flood and no outlet reports flooding today. Finding coverage and tracing the original reveal that in seconds.",
      signals: [
        "Find better coverage: no outlet reports flooding downtown today.",
        "Trace the original: a reverse image search places the photo in 2018.",
        "“RIGHT NOW” and a striking photo are not enough to assert a current fact.",
        "The account is anonymous and gives no verifiable place or time.",
      ],
      recommendation: "Before sharing a viral image, trace whether the context and the date match the present.",
      revealedAnswer: "Discard",
    },
  },
  "feed-60-004": {
    prompt: "Walking 30 minutes a day reduces cardiovascular risk, according to a peer-reviewed study.",
    post: "The portal cites the study DOI and uses careful language.",
    sourceLabel: "health-portal.org · cites the study's DOI",
    verificationHints: [
      "Coverage: a peer-reviewed journal.",
      "Original: a traceable DOI for the study.",
      "Careful language, with no miracles.",
    ],
    feedback: {
      explanation: "Science with a traceable source and careful language: the DOI exists, the study says exactly that, and it promises no miracles.",
      signals: [
        "Find better coverage: the finding appears in a peer-reviewed journal.",
        "Trace the original: the DOI exists and supports the claim with nuance.",
        "Careful language, with no miracle promise or urgency.",
        "The portal cites a checkable study, not a rumor.",
      ],
      recommendation: "When there is a DOI, peer review, and measured language, sharing useful information is appropriate.",
      revealedAnswer: "Share",
    },
  },
  "feed-60-005": {
    prompt: "AUDIO: \"Vaccines carry microchips, I heard it from a nurse who saw it with his own eyes.\"",
    post: "A 4-minute voice note, forwarded many times.",
    sourceLabel: "forwarded many times",
    verificationHints: [
      "Coverage: debunks since 2021.",
      "Original: only an anecdote, zero primary evidence.",
      "It appeals to fear, not data.",
    ],
    feedback: {
      explanation: "It is a debunked hoax: the source is an anonymous “nurse”, it appeals to fear, and fact-checkers disproved it years ago.",
      signals: [
        "Find better coverage: fact-checkers have debunked this theory since 2021.",
        "Trace the original: there is no primary evidence, only a forwarded anecdote.",
        "An anonymous “nurse” is not a source you can locate.",
        "The chain appeals to fear and asks for credibility through repetition.",
      ],
      recommendation: "If the proof is “I heard it from someone”, discard it and look for a debunk or a health authority source.",
      revealedAnswer: "Discard",
    },
  },
  "feed-60-006": {
    prompt: "Man marries his wifi router: \"It never failed me, it was always there.\"",
    post: "Absurd headline from an outlet that declares itself humorous.",
    sourceLabel: "The Satirical Lighthouse · humor",
    verificationHints: [
      "Coverage: it is not news; it is humor.",
      "Original: “About” declares satire.",
      "Without context it confuses people.",
    ],
    feedback: {
      explanation: "It is satire: the site declares itself humorous. Sharing it as news creates confusion; discarding it as a fact is the right decision.",
      signals: [
        "Find better coverage: there is no journalistic coverage because it is not a fact.",
        "Trace the original: the outlet itself clarifies in “About” that this is humor.",
        "The absurd scenario calls for a critical reading before sharing it as news.",
        "Out of context, satire circulates as if it were real.",
      ],
      recommendation: "Before sharing a strange headline, check whether the outlet is satirical; out of context it creates confusion.",
      revealedAnswer: "Discard",
    },
  },
  "feed-60-007": {
    prompt: "The Central Bank keeps the interest rate at 5.75%, according to an official statement published today.",
    post: "Exact figure and institutional language, with no emotional charge.",
    sourceLabel: "bcr.gob.pe · official statement",
    verificationHints: [
      "Coverage: it matches the institutional site.",
      "Original: a dated official statement.",
      "An exact, verifiable figure.",
    ],
    feedback: {
      explanation: "It is official, verifiable data: an institutional statement, an exact figure, and language with no emotional charge.",
      signals: [
        "Find better coverage: the statement can be cross-checked on the institutional site.",
        "Trace the original: the dated official statement is the primary source.",
        "bcr.gob.pe is the official domain of the Central Bank.",
        "Exact figure and language with no emotional charge.",
      ],
      recommendation: "Sharing an official statement with a figure and a date helps inform without distorting.",
      revealedAnswer: "Share",
    },
  },
  "feed-60-008": {
    prompt: "Unemployment is SOARING! Look at this chart — and this photo of \"chaos\" in the city.",
    post: "An anonymous blog mixes a chart and a striking image.",
    sourceLabel: "political-blog.anon",
    media: {
      alt: "Dense smoke plume over an urban landscape at dusk.",
      fallbackText: IMAGE_FALLBACK_TEXT,
    },
    verificationHints: [
      "Coverage: official series without a cropped axis.",
      "Original: truncated axis + out-of-context photo.",
      "The numbers exist; so does the exaggeration.",
    ],
    feedback: {
      explanation: "The numbers exist, but the chart manipulates the scale and the smoke photo does not prove the figure. Finding official coverage and tracing the original reveal the visual manipulation.",
      signals: [
        "Find better coverage: official series show a small change, not a drama.",
        "Trace the original: the truncated Y axis and the smoke photo do not prove a jump in unemployment.",
        "The headline shouts “SOARING” before showing the real magnitude.",
        "An anonymous blog mixes a manipulated chart and a striking image with no methodology.",
      ],
      recommendation: "Before sharing a viral chart, look at the scale: a truncated axis can lie without inventing a single number.",
      revealedAnswer: "Discard",
    },
  },
  "feed-60-009": {
    prompt: "CONGRATULATIONS: you have been selected to win an iPhone. Just share this link with 15 contacts.",
    post: "A prize in exchange for forwarding: opaque .xyz domain.",
    sourceLabel: "mobile-prizes.xyz",
    verificationHints: [
      "Coverage: no brand gives away iPhones this way.",
      "Original: a harvesting link, not a prize.",
      "A recently registered domain.",
    ],
    feedback: {
      explanation: "It is a pyramid recruitment scheme: the “prize” does not exist and your obligation to forward it is the product.",
      signals: [
        "Find better coverage: no legitimate brand gives away phones through chain messages.",
        "Trace the original: the link exists to harvest contacts, not to deliver a prize.",
        "Opaque, recently registered .xyz domain.",
        "An impossible prize in exchange for forwarding is the scam.",
      ],
      recommendation: "If they ask you to forward something in exchange for an impossible gift, discard it: the sharing is the scam.",
      revealedAnswer: "Discard",
    },
  },
  "feed-60-010": {
    prompt: "City council: scheduled water outage tomorrow from 9:00 to 14:00 in districts 4 and 7.",
    post: "Maintenance notice published by the official account.",
    sourceLabel: "muni.gob.pe · official account",
    verificationHints: [
      "Coverage: it matches the official website.",
      "Original: the municipal statement.",
      "Concrete schedule and districts.",
    ],
    feedback: {
      explanation: "It is an official service notice: a municipal source, a concrete schedule, and it matches the institutional website. Sharing it helps the neighbors.",
      signals: [
        "Find better coverage: the notice matches the institutional website.",
        "Trace the original: the municipal statement is the primary source.",
        "muni.gob.pe is the official municipal account.",
        "Concrete schedule and districts: actionable service information.",
      ],
      recommendation: "Not everything in the feed is a trap: sharing verified official notices is a favor to your community.",
      revealedAnswer: "Share",
    },
  },

  "mente-maestra-001": {
    prompt: "Step 1 · Investigate the intention: what does this fake news want from you? Choose the simulation objective.",
    options: [
      {
        optionId: "objective-health-panic",
        label: "Health panic",
        description: "Make people fear vaccines, hospitals, or medicines with a manufactured alarm.",
      },
      {
        optionId: "objective-political-attack",
        label: "Political attack",
        description: "Destroy the reputation of a public figure with a misleading clip or statistic.",
      },
      {
        optionId: "objective-click-scam",
        label: "Click scam",
        description: "Harvest traffic and data with impossible promises or invented benefits.",
      },
    ],
    feedback: {
      explanation: "Always investigate the intention: to frighten, to enrage, or to deceive for attention. Recognizing the objective is the first step toward not feeding the chain.",
      signals: [
        "Investigate: the piece wants a fast reaction, not a fact you can check.",
        "The benefit goes to whoever amplifies the message, not to whoever receives it.",
        "No objective in this simulation is ever published or turned into a real account.",
      ],
      recommendation: "Before sharing, investigate what the message wants from you: fear, a vote, a click, or money.",
      revealedAnswer: "Manipulation objective identified",
    },
  },
  "mente-maestra-002": {
    prompt: "Step 2 · Investigate the emotional hook: which feeling would push people to share without verifying?",
    options: [
      {
        optionId: "emotion-fear",
        label: "Fear",
        description: "“If you do not act now, your family is in danger.” The emotion most used to skip verification.",
      },
      {
        optionId: "emotion-anger",
        label: "Anger",
        description: "“Someone powerful is robbing you and nobody is doing anything.” Manufactured outrage seeks the immediate forward.",
      },
      {
        optionId: "emotion-miracle-hope",
        label: "Miracle hope",
        description: "“The secret solution they do not want you to know about.” It promises a miracle with no proof.",
      },
    ],
    feedback: {
      explanation: "Investigate the emotion before you react: fear, anger, and miracle hope speed up the click and do not prove a fact.",
      signals: [
        "Investigate: the text tells you what to feel before it tells you what happened.",
        "Emotional urgency takes the place of evidence.",
        "Whoever benefits from your reaction is not always the person shown in the message.",
      ],
      recommendation: "If a post frightens you, enrages you, or promises a miracle, investigate first and share afterwards — or do not share at all.",
      revealedAnswer: "Hook emotion recognized",
    },
  },
  "mente-maestra-003": {
    prompt: "Step 3 · Investigate the headline: design the trap that would make the fake piece believable.",
    options: [
      {
        optionId: "headline-conspiracy-caps",
        label: "THEY ARE HIDING IT!! What the authorities do not want you to know about this",
        description: "Conspiracy, urgency, and capital letters: designed for the click, not to inform.",
      },
      {
        optionId: "headline-vague-experts",
        label: "Experts warn: a new phenomenon is worrying families",
        description: "Vague authority and soft alarm: it looks serious, but it names no one and no study.",
      },
      {
        optionId: "headline-fake-official",
        label: "Official statement: extraordinary measures starting Monday",
        description: "It imitates the institutional format in order to slip in as real information.",
      },
    ],
    feedback: {
      explanation: "Investigate the headline: capital letters, false authority, or official formats tell you what to feel instead of what happened.",
      signals: [
        "Investigate: capital letters, “they are hiding it”, or zero concrete data all point to bait.",
        "“Experts” with no name and no institution are an empty authority.",
        "The format of an official statement is easy to fake: verify the real domain.",
      ],
      recommendation: "Demand a name, an institution, and a concrete fact. If the headline only shouts, leave without sharing.",
      revealedAnswer: "Trap headline dissected",
    },
  },
  "mente-maestra-004": {
    prompt: "Step 4 · Trace the “proof”: choose the false evidence. Then you will see the assembled story and its autopsy.",
    options: [
      {
        optionId: "evidence-recycled-photo",
        label: "Recycled old photo",
        description: "A real image from another year and another place, presented as if it were from “today”.",
      },
      {
        optionId: "evidence-ai-image",
        label: "AI-generated image",
        description: "Hyper-realistic and emotional… with incoherent hands, text, or shadows if you look at it calmly.",
      },
      {
        optionId: "evidence-fake-expert",
        label: "Invented expert",
        description: "“Dr. Fernández, a prestigious specialist, confirms that…” — except he does not exist.",
      },
      {
        optionId: "evidence-truncated-axis",
        label: "Chart with a truncated axis",
        description: "Real data with visual exaggeration: cutting the axis turns a small change into a “catastrophe”.",
      },
    ],
    feedback: {
      explanation: "Trace the original: the “proof” is usually a recycled image, AI, an invented expert, or a manipulated chart. The autopsy turns those techniques into detection signals.",
      signals: [
        "Trace: a real photo also deceives when the date or place is changed.",
        "Incoherent hands, text, and shadows give away synthetic images.",
        "An expert with no academic trace, or a truncated axis, manufactures false credibility.",
      ],
      recommendation: "Trace with reverse image search, check the cited author, and review the axes before believing or sharing.",
      revealedAnswer: "False proof and autopsy ready",
    },
  },
};

export const ENGLISH_AUTOPSY_BY_OPTION_ID: Record<
  string,
  Readonly<{ title: string; tip: string }>
> = {
  "objective-health-panic": {
    title: "Health panic",
    tip: "Investigate: if a message asks you to abandon a treatment or fear public health without an official source, check the institutional channel.",
  },
  "objective-political-attack": {
    title: "Political attack",
    tip: "Investigate the full clip and primary source before getting angry: a fragment out of context can manufacture a scandal.",
  },
  "objective-click-scam": {
    title: "Click scam",
    tip: "Investigate the institution on its real domain: impossible promises and urgent forms usually seek data or traffic.",
  },
  "emotion-fear": {
    title: "Fear",
    tip: "Investigate before forwarding: fear is the main fuel of virality. Nothing urgent should be verified only after sharing.",
  },
  "emotion-anger": {
    title: "Anger",
    tip: "Investigate who benefits from your anger: manufactured outrage wants you to share before you think.",
  },
  "emotion-miracle-hope": {
    title: "Miracle hope",
    tip: "Investigate the promise: miracles with no studies do not exist. \"What they are hiding\" almost always means \"I have no proof\".",
  },
  "headline-conspiracy-caps": {
    title: "Conspiracy in capital letters",
    tip: "Investigate the concrete fact: capital letters + \"they are hiding it\" + zero facts = a headline for your click, not to inform you.",
  },
  "headline-vague-experts": {
    title: "Vague experts",
    tip: "Investigate the \"expert\": which name, from which institution, in which study?",
  },
  "headline-fake-official": {
    title: "Fake official format",
    tip: "Investigate the institution's real domain: the official format is easy to fake.",
  },
  "evidence-recycled-photo": {
    title: "Recycled old photo",
    tip: "Trace with reverse image search: it reveals the original date and place in seconds.",
  },
  "evidence-ai-image": {
    title: "AI-generated image",
    tip: "Trace artifacts: incoherent hands, text, jewelry, and shadows. What looks \"perfect\" can also be suspicious.",
  },
  "evidence-fake-expert": {
    title: "Invented expert",
    tip: "Trace the \"expert\": if they only appear in that story, they were invented. Real specialists leave an academic trail.",
  },
  "evidence-truncated-axis": {
    title: "Chart with a truncated axis",
    tip: "Trace the scale: a cut axis exaggerates any change. The numbers can be real and the conclusion still false.",
  },
};

export const ENGLISH_AUTOPSY_ASSETS = {
  educationalDisclaimer:
    "Educational simulation: no external content is published and no real account is created. Simulated reach explains the mechanism; it is not a prize. Practice Investigate and Trace.",
  fictionalComments: [
    "@worried22: I cannot believe it… SHARED. Everyone needs to know!!",
    "@everyones_aunt: Forwarded to my 8 groups. We have to protect the family.",
    "@skeptic_ok: Source? This smells wrong. The \"proof\" does not add up.",
    "Fact-checkers: This post was marked FALSE. Its simulated reach was reduced. The fictional account was suspended.",
  ],
} as const;

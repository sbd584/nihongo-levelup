// Graded reading passages for 日本語 Level Up
// Each passage uses vocabulary appropriate to its JLPT level + rank tier
// E = easiest within level, S = hardest (near pass-confident)
// Words enclosed in || pipes || are tappable glossary words from the word bank

export type PassageRank = "E" | "D" | "C" | "B" | "A" | "S";
export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export interface GlossWord {
  word: string;
  reading: string;
  meaning: string;
}

export interface Passage {
  id: string;
  level: JLPTLevel;
  rank: PassageRank;
  title: string;
  titleEn: string;
  text: string; // Japanese text — words to gloss are marked with [word|reading|meaning]
  textEn: string; // Full English translation paragraph by paragraph (\n separated)
  // furigana: array of [kanji, reading] pairs for inline ruby rendering
  furigana: Array<[string, string]>;
  genre: string; // "slice-of-life" | "fantasy" | "mystery" | "romance" | "adventure"
  wordCount: number;
}

// Format: [word|reading|meaning] inside the text marks a tappable glossed word
// Plain kanji/kana outside brackets is readable as-is

export const PASSAGES: Passage[] = [
  // ─── N5 ───────────────────────────────────────────────────────────────────
  {
    id: "n5-e",
    level: "N5",
    rank: "E",
    title: "あさごはん",
    titleEn: "Breakfast",
    genre: "slice-of-life",
    wordCount: 55,
    textEn: `I eat breakfast every morning.

This morning I drank green tea. It was very delicious.

After that I brushed my teeth and went to school. It was bright outside and the weather was nice.

"Good morning," I said to my friend. My friend said "Good morning" back.

School was fun.`,
    furigana: [["花","はな"],["明","あか"],["暑","あつ"],["茶","ちゃ"]],
    text: `わたしは まいあさ ごはんを たべます。

きょうの あさは [お茶|おちゃ|green tea]を のみました。とても おいしかったです。

それから はを みがいて、がっこうへ いきました。そとは [明るい|あかるい|bright]くて、いい てんきでした。

「おはよう」と ともだちに いいました。ともだちも「おはよう」と こたえました。

がっこうは たのしかったです。`,
  },
  {
    id: "n5-d",
    level: "N5",
    rank: "D",
    title: "こうえんで",
    titleEn: "At the Park",
    genre: "slice-of-life",
    wordCount: 70,
    textEn: `Yesterday I went to the park with my friend. There were lots of beautiful flowers blooming in the park.

"It's hot, isn't it!" said my friend. I replied "Yeah, it's hot."

We sat under a tree together and ate our packed lunch — rice balls and tamagoyaki. It was very delicious.

We relaxed while looking at the flowers. I thought I wished days like this could go on forever.`,
    furigana: [["花","はな"],["暑","あつ"]],
    text: `きのう、ともだちと こうえんへ いきました。こうえんには きれいな [花|はな|flower]が たくさん さいていました。

「[暑い|あつい|hot]ね！」と ともだちが いいました。わたしも「うん、[暑い|あつい|hot]ね」と こたえました。

ふたりで きの したに すわって、おべんとうを たべました。おにぎりと たまごやきです。とても おいしかったです。

[花|はな|flower]を みながら、のんびり しました。こんな ひが もっと つづけば いいなと おもいました。`,
  },
  {
    id: "n5-c",
    level: "N5",
    rank: "C",
    title: "おかいもの",
    titleEn: "Shopping",
    genre: "slice-of-life",
    wordCount: 85,
    textEn: `Today I went to the shop with my mother.

There were all kinds of things at the shop. I wanted a vase. I found a small white vase and said to my mother, "This one is good!"

My mother said "How cute!" and bought it for me.

We went home and put it on the table. Light came in through the window and the vase shone beautifully. I look forward to seeing it every day.`,
    furigana: [["花瓶","かびん"],["母","かあ"]],
    text: `きょうは おかあさんと いっしょに おみせへ いきました。

おみせには いろいろな ものが ありました。わたしは [花瓶|かびん|vase]が ほしかったです。ちいさくて しろい [花瓶|かびん|vase]を みつけて、「これが いい！」と おかあさんに いいました。

おかあさんは「かわいいね」と いって、かってくれました。

いえに かえって、テーブルの うえに おきました。まどから ひかりが はいって、[花瓶|かびん|vase]が きれいに ひかりました。まいにち これを みるのが たのしみです。`,
  },
  {
    id: "n5-b",
    level: "N5",
    rank: "B",
    title: "はじめての でんしゃ",
    titleEn: "First Train Ride",
    genre: "adventure",
    wordCount: 100,
    textEn: `I rode the train alone for the first time. So that nothing would go wrong, I read the map in both English and Japanese.

Inside the train there were many convenient announcements. Through the window I could see buildings lined up.

When I arrived at the station, my head got confused. I didn't know which way to go. But I looked at the note in my pocket and walked in the right direction.

When I arrived at my destination, I was very happy. It was far more exciting than my usual morning routine. When I got home and told my mother, she praised me saying "Very well done."`,
    furigana: [["電車","でんしゃ"],["英語","えいご"],["問題","もんだい"],["頭","あたま"],["方向","ほうこう"],["目的地","もくてきち"]],
    text: `はじめて ひとりで でんしゃに のりました。[問題|もんだい|problem]が おきないように、[英語|えいご|English]と にほんごの りょうほうで ちずを よみました。

でんしゃの なかは[便利|べんり|convenient]な アナウンスが たくさん ありました。まどから[並ぶ|ならぶ|lined up]ビルが みえました。

えきに つくと、[頭|あたま|head]が こんらんしました。どちらへ[取る|とる|to take]ればいいか わからなかったのです。でも、[ポケット|ポケット|pocket]に いれた めも を みて、ただしい ほうこうに あるきました。

もくてきちに ついたとき、とても うれしかったです。[毎朝|まいあさ|every morning]の ルーティンより、ずっと どきどきしました。[家|いえ|house]に かえって、おかあさんに はなすと、「[たいへん|たいへん|very]よく できた」と ほめてくれました。`,
  },
  {
    id: "n5-a",
    level: "N5",
    rank: "A",
    title: "ゆきのひ",
    titleEn: "A Snowy Day",
    genre: "slice-of-life",
    wordCount: 110,
    textEn: `Today it is snowing. Outside with the black clouds and white snow, it is very beautiful.

I made green tea in the kitchen. I turn on the lights and drink it in the warm room. While eating snacks with chopsticks, I looked outside the window.

The child next door was playing. They are making a snowman. I called out "Aren't you cold?" and they replied "It's cold but fun!"

There is nothing wrong. On snowy days, even the convenient city becomes quiet. My mind somehow feels peaceful too. I thought I wished mornings like this could continue.`,
    furigana: [["今日","きょう"],["電気","でんき"],["台所","だいどころ"],["頭","あたま"],["病気","びょうき"]],
    text: `[今日|きょう|today]は ゆきが ふっています。そとは[黒|くろ|black]い くもと しろい ゆきで、とても きれいです。

わたしは[台所|だいどころ|kitchen]で[お茶|おちゃ|green tea]を つくりました。[電気|でんき|electric light]を つけて、あたたかい へやで のみます。[はし|はし|chopsticks]で おかしを たべながら、まどの そとを みました。

となりの いえの こどもが[遊ぶ|あそぶ|to play]ていました。ゆきで だるまを つくっています。「[暑い|あつい|hot]くないの？」と こえを かけると、「さむいけど たのしい！」と こたえました。

[問題|もんだい|problem]は なにも ありません。ゆきの ひは、[便利|べんり|convenient]な まちも しずかに なります。[頭|あたま|head]の なかも、なんとなく おだやかです。[毎朝|まいあさ|every morning]、こんな ひが つづけば いいなと おもいました。`,
  },
  {
    id: "n5-s",
    level: "N5",
    rank: "S",
    title: "てがみ",
    titleEn: "The Letter",
    genre: "romance",
    wordCount: 120,
    textEn: `A postcard arrived. The sender is someone who was in the same class as me long ago.

"Every morning I think of your English class. You were always writing compositions in a black notebook."

I held my head in my hands. I remember. Back then, there were nothing but problems, and when class ended I would be alone, shutting off the lights.

"Are you now drinking tea in someone's kitchen? Are there flowers in a vase?"

I took a pen from my pocket and began writing a reply. Knowing that convenient words couldn't convey this feeling.`,
    furigana: [["葉書","はがき"],["英語","えいご"],["作文","さくぶん"],["問題","もんだい"],["花瓶","かびん"],["便利","べんり"]],
    text: `[葉書|はがき|postcard]が とどきました。さしだしにんは、むかし おなじ クラスだった ひとです。

「[毎朝|まいあさ|every morning]、きみの[英語|えいご|English]の じゅぎょうを おもいだします。きみは[黒|くろ|black]い ノートに いつも[作文|さくぶん|writing]を かいていましたね。」

わたしは[頭|あたま|head]を かかえました。おぼえています。あの ころ、[問題|もんだい|problem]ばかりで、クラスが おわると[電気|でんき|electric light]を[閉める|しめる|to close]ように して ひとりで いました。

「いまは どこかの[家|いえ|house]の[台所|だいどころ|kitchen]で、[お茶|おちゃ|green tea]を のんでいますか。[花瓶|かびん|a vase]には[花|はな|flower]が ありますか。」

[ポケット|ポケット|pocket]から[ペン|ペン|pen]を とりだして、へんじを かきはじめました。[便利|べんり|convenient]な ことばでは、このきもちは つたわらないと おもいながら。`,
  },

  // ─── N4 ───────────────────────────────────────────────────────────────────
  {
    id: "n4-e",
    level: "N4",
    rank: "E",
    title: "あたらしい しごと",
    titleEn: "The New Job",
    genre: "slice-of-life",
    wordCount: 100,
    textEn: `A new job starts next week. I am prepared but a little nervous.

The company is near the station. I plan to commute by train every day.

Yesterday I went to buy the necessary things — a planner, a ballpoint pen, and so on. The store clerk kindly showed me where things were.

"Are you alright?" my friend asked. I answered "Yeah, I'm fine," but honestly I was worried.`,
    furigana: [["来週","らいしゅう"],["仕事","しごと"],["会社","かいしゃ"],["駅","えき"],["予定","よてい"],["必要","ひつよう"],["心配","しんぱい"]],
    text: `らいしゅうから あたらしい しごとが はじまります。[準備|じゅんび|preparation]は できていますが、すこし きんちょうしています。

[会社|かいしゃ|company]は えきから[近い|ちかい|near]ところに あります。まいにち でんしゃで かよう[予定|よてい|plan]です。

きのう、[必要|ひつよう|necessary]な もの を かいに いきました。[手帳|てちょう|notebook/planner]や ボールペンなど です。[店員|てんいん|store clerk]さんが[親切|しんせつ|kind]に おしえてくれました。

「[大丈夫|だいじょうぶ|alright]ですか？」と ともだちが きいてくれました。「うん、[大丈夫|だいじょうぶ|alright]」と こたえましたが、ほんとうは[心配|しんぱい|worry]でした。`,
  },
  {
    id: "n4-d",
    level: "N4",
    rank: "D",
    title: "やまの うえで",
    titleEn: "On the Mountain",
    genre: "adventure",
    wordCount: 110,
    textEn: `That day, we climbed the mountain. The weather was good and the sky was blue.

The path was steep, but we helped each other and climbed. Along the way there was a beautiful river.

"I'm tired," someone said. But when we reached the summit, all that tiredness vanished.

In the distance we could see the town. Small houses were lined up. I was deeply moved.

"Let's come again," we promised.`,
    furigana: [["天気","てんき"],["空","そら"],["川","かわ"],["感動","かんどう"],["約束","やくそく"]],
    text: `その ひ、わたしたちは やまに のぼりました。[天気|てんき|weather]は よく、[空|そら|sky]は あおかったです。

みちは[急|きゅう|steep/sudden]でしたが、みんなで[助ける|たすける|to help]あいながら のぼりました。[途中|とちゅう|on the way]で きれいな[川|かわ|river]が ありました。

「[疲れた|つかれた|tired]ね」と だれかが いいました。でも、てっぺんに つくと、その[疲れ|つかれ|tiredness]が すべて きえました。

[遠く|とおく|far away]に まちが みえました。[小さい|ちいさい|small]いえが[並ぶ|ならぶ|lined up]でいました。[感動|かんどう|moved/impressed]しました。

「また こよう」と[約束|やくそく|promise]しました。`,
  },
  {
    id: "n4-c",
    level: "N4",
    rank: "C",
    title: "ふるい しゃしん",
    titleEn: "Old Photos",
    genre: "slice-of-life",
    wordCount: 120,
    textEn: `While tidying up my grandfather's room, I found some old photographs. A young grandfather is smiling in them.

"This is an old photo," my grandfather said. "After the war ended, everyone celebrated together."

I listened in silence. My grandfather's voice was quiet, but there was weight to his words.

"What is important doesn't change," my grandfather continued. I wrote those words in my notebook.`,
    furigana: [["部屋","へや"],["古","ふる"],["写真","しゃしん"],["昔","むかし"],["戦争","せんそう"],["言葉","ことば"],["大切","たいせつ"]],
    text: `おじいさんの[部屋|へや|room]を かたづけていると、[古い|ふるい|old]しゃしんを みつけました。[若い|わかい|young]おじいさんが[笑顔|えがお|smile]で うつっています。

「これは[昔|むかし|long ago]の[写真|しゃしん|photograph]だよ」と おじいさんが いいました。「[戦争|せんそう|war]が おわって、みんなで[祝う|いわう|to celebrate]ったんだ。」

わたしは[黙って|だまって|silently]きいていました。おじいさんの[声|こえ|voice]は[静か|しずか|quiet]でしたが、その[言葉|ことば|words]には おもさが ありました。

「[大切|たいせつ|important/precious]なことは[変わる|かわる|to change]わらない」と おじいさんは[続ける|つづける|to continue]けました。わたしは その[言葉|ことば|words]を[手帳|てちょう|notebook]に かきました。`,
  },
  {
    id: "n4-b",
    level: "N4",
    rank: "B",
    title: "よるの えき",
    titleEn: "The Night Station",
    genre: "mystery",
    wordCount: 130,
    textEn: `The night station was quiet. The last train left and only I remained on the platform.

Suddenly, a lone woman was standing on the platform across. I couldn't see her face, but her long black hair swayed in the wind.

I tried to approach but my feet wouldn't move. My heart beat fast.

The next moment, the woman had vanished. All that was left was one sheet of white tissue, fallen on the rails.

I hurried out of the station. That night I couldn't sleep.`,
    furigana: [["静","しず"],["最終","さいしゅう"],["突然","とつぜん"],["女性","じょせい"],["心臓","しんぞう"],["瞬間","しゅんかん"]],
    text: `よるの えきは[静か|しずか|quiet]だった。[最終|さいしゅう|last (train)]でんしゃが でていき、プラットフォームに は わたしだけが のこった。

[突然|とつぜん|suddenly]、むこうの ほームに ひとりの[女性|じょせい|woman]が たっていた。[顔|かお|face]は みえなかったが、[長い|ながい|long]くろいかみが かぜに ゆれていた。

わたしは[近づく|ちかづく|to approach]こうとしたが、[足|あし|legs/feet]が うごかなかった。[心臓|しんぞう|heart]が はやく うった。

[次の瞬間|つぎのしゅんかん|the next moment]、その[女性|じょせい|woman]は きえていた。あとには[白い|しろい|white]はながみが いちまい、レールの うえに おちていた。

わたしは[急いで|いそいで|hurriedly]えきを でた。その よるは[眠れない|ねむれない|couldn't sleep]なかった。`,
  },
  {
    id: "n4-a",
    level: "N4",
    rank: "A",
    title: "りゅうがくせい",
    titleEn: "The Exchange Student",
    genre: "slice-of-life",
    wordCount: 140,
    textEn: `Maria has been living in Japan since last year. The language is difficult but she works hard every day.

After class I asked Maria "Isn't Japanese tough?"

"It's tough but fun," Maria answered. "Because I love Japanese culture, I can keep going."

I was moved by those words. Even though I was born in Japan, I had been taking Japanese culture for granted.

"Thank you," I said. Maria laughed, puzzled. "Why?"

"Because you made me realize."`,
    furigana: [["去年","きょねん"],["言語","げんご"],["努力","どりょく"],["授業","じゅぎょう"],["文化","ぶんか"],["感動","かんどう"]],
    text: `マリアは[去年|きょねん|last year]から にほんに すんでいる。[言語|げんご|language]は むずかしいが、まいにち[努力|どりょく|effort]している。

[授業|じゅぎょう|class/lesson]のあと、わたしは マリアに「にほんごは[大変|たいへん|tough/hard]じゃない？」と きいた。

「[大変|たいへん|tough/hard]だけど、たのしい」と マリアは[答える|こたえる|to answer]えた。「にほんの[文化|ぶんか|culture]が すきだから、がんばれる。」

そのことばに わたしは[感動|かんどう|moved/impressed]した。わたしは にほんに うまれたのに、にほんの[文化|ぶんか|culture]を[当たり前|あたりまえ|taken for granted]に おもっていた。

「ありがとう」と わたしは いった。マリアは[不思議|ふしぎ|strange/mysterious]そうに わらった。「なぜ？」

「[気づかせて|きづかせて|made me realize]くれたから」。`,
  },
  {
    id: "n4-s",
    level: "N4",
    rank: "S",
    title: "かわの むこう",
    titleEn: "Across the River",
    genre: "fantasy",
    wordCount: 150,
    textEn: `Across the river there was a forest that nobody went to. Children said "there are ghosts" and adults said "it's dangerous."

But one autumn, I crossed over.

Inside the forest was quiet, and autumn leaves were falling. Light streamed in between the trees. I wasn't afraid. Rather, I felt calm.

As I went deeper, small white flowers were blooming. They were arranged beautifully, as if someone had planted them.

I reached out my hand toward the flowers. Just then, a branch snapped behind me.

When I turned around, a small fox was staring at me quietly.`,
    furigana: [["川","かわ"],["森","もり"],["幽霊","ゆうれい"],["危険","きけん"],["光","ひかり"],["奥","おく"],["花","はな"]],
    text: `[川|かわ|river]の むこうには、だれも いかない[森|もり|forest]が あった。こどもたちは「[幽霊|ゆうれい|ghost]が いる」と いい、おとなたちは「[危険|きけん|dangerous]だ」と いった。

でも、ある あき、わたしは[渡る|わたる|to cross]ってしまった。

[森|もり|forest]の なかは[静か|しずか|quiet]で、あきの[葉|は|leaf]が ちっていた。[光|ひかり|light]が き の あいだから さしこんでいた。こわくは なかった。むしろ、[落ち着く|おちつく|to feel calm]いた。

[奥|おく|the back/depths]に すすむと、[小さい|ちいさい|small]しろい[花|はな|flower]が さいていた。[誰か|だれか|someone]が うえたような、きれいな[並び|ならび|arrangement]だった。

わたしは その[花|はな|flower]に てを のばした。そのとき、うしろで えだが おれる おとが した。

ふりかえると、[小さい|ちいさい|small]きつねが じっと わたしを みていた。`,
  },

  // ─── N3 ───────────────────────────────────────────────────────────────────
  {
    id: "n3-e",
    level: "N3",
    rank: "E",
    title: "都市の孤独",
    titleEn: "City Solitude",
    genre: "slice-of-life",
    wordCount: 130,
    textEn: `Three years have passed since I moved to the city. Even though people overflow around me, I sometimes feel loneliness.

On the commuter train, everyone looks at their screens. There is no one to exchange words with.

One evening, I dropped my wallet on the way home. I noticed at the ticket gate. I rushed back in a panic, and an old man I didn't know was holding it.

"This is your lost item," he said with a warm smile.

With that smile, I felt the loneliness melt away a little.`,
    furigana: [["都市","とし"],["孤独","こどく"],["通勤","つうきん"],["財布","さいふ"],["笑顔","えがお"]],
    text: `[都市|とし|city]に[引っ越して|ひっこして|having moved]から三年が[経つ|たつ|to pass (time)]った。まわりには[人|ひと|people]が あふれているのに、[孤独|こどく|loneliness]を[感じる|かんじる|to feel]ことがある。

[通勤|つうきん|commuting]でんしゃのなかで、みんな[画面|がめん|screen]を みている。[言葉|ことば|words]を かわすひとは いない。

ある[夜|よる|night]、[帰り道|かえりみち|way home]に[財布|さいふ|wallet]を おとした。[気づいた|きづいた|noticed]のは えきの かいさつで だった。[焦る|あせる|to panic]って もどると、[見知らぬ|みしらぬ|unknown/stranger's]おじさんが もっていてくれた。

「[落とし物|おとしもの|lost item]ですよ」と いって、にっこり わらった。

その[笑顔|えがお|smile]で、[孤独|こどく|loneliness]が すこし とけた きがした。`,
  },
  {
    id: "n3-d",
    level: "N3",
    rank: "D",
    title: "夜の図書館",
    titleEn: "The Night Library",
    genre: "mystery",
    wordCount: 150,
    textEn: `The library closes at nine in the evening. But that day I carelessly got left inside.

The lights went out and silence arrived. My smartphone was dead.

As I groped my way forward in the darkness, I saw a light from the back.

As I approached, it was a candle flame. Beside it sat an elderly woman.

"Are you lost?" she asked gently.

"Yes..."

"People who love books sometimes end up unable to leave this place," the woman laughed.`,
    furigana: [["図書館","としょかん"],["電気","でんき"],["静寂","せいじゃく"],["暗闇","くらやみ"],["女性","じょせい"]],
    text: `[図書館|としょかん|library]は よるの[九時|くじ|9 o'clock]に[閉まる|しまる|to close]まる。でも、その ひ、わたしは うっかり なかに のこってしまった。

[電気|でんき|electric light]が[消える|きえる|to disappear/go out]えて、[静寂|せいじゃく|silence]が おとずれた。スマートフォンは[電池切れ|でんちぎれ|battery dead]だった。

[暗闇|くらやみ|darkness]のなかを[手探り|てさぐり|groping/feeling around]で すすんでいると、[奥|おく|the back/depths]の ほうから[光|ひかり|light]が みえた。

[近づく|ちかづく|to approach]くと、それは ろうそくの ひだった。そのそばに、[老い|おい|old age]た[女性|じょせい|woman]が[座って|すわって|sitting]いた。

「[迷子|まいご|lost child]ですか？」と[優しく|やさしく|gently]きいた。

「はい...」

「[本|ほん|book]が[好き|すき|like]なひとは、ここを でられなくなることが あるんですよ」と、その[女性|じょせい|woman]は わらった。`,
  },
  {
    id: "n3-c",
    level: "N3",
    rank: "C",
    title: "剣士の朝",
    titleEn: "The Swordsman's Morning",
    genre: "fantasy",
    wordCount: 160,
    textEn: `Waking before dawn and taking up the sword — this is swordsman Yuu's daily routine.

The training is harsh, but Yuu doesn't complain. Because the master taught him: "When your heart is quiet, the blade becomes sharp."

One morning, the master unusually spoke to him.

"What do you think an enemy is?"

Yuu thought for a while. "Something strong?"

The master shook his head. "It is fear. The fear that dwells inside one's own heart is the most dangerous enemy."`,
    furigana: [["夜明け","よあけ"],["剣","けん"],["修行","しゅぎょう"],["師匠","ししょう"],["心","こころ"],["刃","やいば"],["恐れ","おそれ"]],
    text: `[夜明け|よあけ|dawn]まえに おきて、[剣|けん|sword]を とる。これが[剣士|けんし|swordsman]ユウの まいにちだ。

[修行|しゅぎょう|training/discipline]は[厳しい|きびしい|strict/harsh]いが、ユウは[文句|もんく|complaint]を いわない。[師匠|ししょう|master/teacher]に「[心|こころ|heart/mind]が[静か|しずか|quiet]なとき、[刃|やいば|blade]は[鋭く|するどく|sharp]なる」と おそわったからだ。

ある[朝|あさ|morning]、[師匠|ししょう|master/teacher]が[珍しく|めずらしく|unusually]はなしかけてきた。

「[敵|てき|enemy]とは なんだと おもう？」

ユウは[しばらく|しばらく|for a while]かんがえた。「[強い|つよい|strong]もの、ですか？」

[師匠|ししょう|master/teacher]は[首|くび|neck/head]を ふった。「[恐れ|おそれ|fear]だ。[自分|じぶん|oneself]の[心|こころ|heart/mind]の なかに いる[恐れ|おそれ|fear]こそ、もっとも[危険|きけん|dangerous]な[敵|てき|enemy]だ。」

ユウは[刃|やいば|blade]を[握る|にぎる|to grip]って、うなずいた。`,
  },
  {
    id: "n3-b",
    level: "N3",
    rank: "B",
    title: "消えた記憶",
    titleEn: "The Vanished Memory",
    genre: "mystery",
    wordCount: 170,
    textEn: `When I woke up, I had no memory. No name, no address, no family.

In the hospital bed, a doctor was explaining. "You hit your head in an accident. It may be temporary amnesia."

The word "temporary" stuck in my heart. What if it doesn't come back?

By the pillow there was a small photograph. A woman, a child, and me — lined up, smiling.

As I stared at the photograph, tears came. I didn't know why. But my body remembered that this smile was something precious.`,
    furigana: [["記憶","きおく"],["名前","なまえ"],["住所","じゅうしょ"],["家族","かぞく"],["病院","びょういん"],["医者","いしゃ"],["写真","しゃしん"],["涙","なみだ"]],
    text: `[目覚める|めざめる|to wake up]めると、[記憶|きおく|memory]がなかった。[名前|なまえ|name]も、[住所|じゅうしょ|address]も、[家族|かぞく|family]のことも。

[病院|びょういん|hospital]のベッドで、[医者|いしゃ|doctor]が[説明|せつめい|explanation]していた。「[事故|じこ|accident]で[頭|あたま|head]を うちました。[一時的|いちじてき|temporary]な[記憶喪失|きおくそうしつ|amnesia]かもしれません。」

[一時的|いちじてき|temporary]、という[言葉|ことば|words]が[心|こころ|heart/mind]に つかえた。もしかしたら、もどらないのでは？

まくらもとに、[小さい|ちいさい|small]い[写真|しゃしん|photograph]が あった。[女性|じょせい|woman]と こども、そして わたし。[笑顔|えがお|smile]で[並ぶ|ならぶ|lined up]んでいる。

その[写真|しゃしん|photograph]を[見つめる|みつめる|to stare at]ていると、[涙|なみだ|tears]が でてきた。[理由|りゆう|reason]は わからなかった。でも、この[笑顔|えがお|smile]は、[大切|たいせつ|important/precious]なものだと からだが おぼえていた。`,
  },
  {
    id: "n3-a",
    level: "N3",
    rank: "A",
    title: "異世界の地図",
    titleEn: "Map of Another World",
    genre: "fantasy",
    wordCount: 180,
    textEn: `The map was old, its edges torn. But it was the only clue.

Luna spread the map out and confirmed her current location. Three more days' journey to the destination.

Along the way is a forest where monsters dwell. Detouring would take five days. Should she risk the danger and go straight, or choose the safe route?

"There's no time," Luna murmured. The fate of the kingdom rests on this journey.

Gripping the hilt of her sword, Luna stepped into the forest. There was fear. But there was a mission stronger than fear.`,
    furigana: [["地図","ちず"],["古","ふる"],["魔物","まもの"],["森","もり"],["危険","きけん"],["王国","おうこく"],["運命","うんめい"],["使命","しめい"]],
    text: `[地図|ちず|map]は[古い|ふるい|old]く、[端|はし|edge]が やぶれていた。だが、それが[唯一|ゆいいつ|the only]の[手がかり|てがかり|clue]だった。

ルナは[地図|ちず|map]を[広げる|ひろげる|to spread out]げて、[現在地|げんざいち|current location]を[確認|かくにん|confirmation]した。[目的地|もくてきち|destination]まで あと[三日|みっか|three days]の[旅|たび|journey]。

[途中|とちゅう|on the way]には[魔物|まもの|monster]が いる[森|もり|forest]がある。[迂回|うかい|detour]すれば[五日|いつか|five days]かかる。[危険|きけん|dangerous]を おかして[直進|ちょくしん|going straight]するか、[安全|あんぜん|safe]な[道|みち|road]を えらぶか。

「[時間|じかん|time]が ない」と ルナは つぶやいた。[王国|おうこく|kingdom]の[運命|うんめい|fate]は、この[旅|たび|journey]に かかっている。

[剣|けん|sword]の[柄|つか|handle]を[握る|にぎる|to grip]って、ルナは[森|もり|forest]へと[踏み出す|ふみだす|to step forward]した。[恐れ|おそれ|fear]は あった。だが、[恐れ|おそれ|fear]より つよい[使命|しめい|mission]が あった。`,
  },
  {
    id: "n3-s",
    level: "N3",
    rank: "S",
    title: "春の手紙",
    titleEn: "Spring Letter",
    genre: "romance",
    wordCount: 190,
    textEn: `When the season comes for the cherry blossoms to scatter, I think of that letter.

It was the last spring of university. Before the graduation ceremony, an envelope had been placed in my shoe locker.

There was no sender. On the writing paper, only one phrase was written.

"Because you were here, these four years shone."

I didn't know who it was from. I had a few guesses, but lacked the courage to confirm.

Ten years have passed since then. The letter is still kept in a drawer.

Every spring I take it out and read it. Then put it away again.`,
    furigana: [["桜","さくら"],["季節","きせつ"],["卒業式","そつぎょうしき"],["封筒","ふうとう"],["便箋","びんせん"],["引き出し","ひきだし"]],
    text: `[桜|さくら|cherry blossom]が[散る|ちる|to fall/scatter]る[季節|きせつ|season]になると、わたしは あの[手紙|てがみ|letter]を おもいだす。

あれは[大学|だいがく|university]の[最後|さいご|last]の[春|はる|spring]だった。[卒業式|そつぎょうしき|graduation ceremony]の まえ、[下駄箱|げたばこ|shoe locker]に[封筒|ふうとう|envelope]が はいっていた。

[差出人|さしだしにん|sender]は ない。[便箋|びんせん|letter paper]には、たった[一文|ひとこと|one phrase]だけ かかれていた。

「あなたが いてくれたから、この[四年間|よねんかん|four years]が[輝いた|かがやいた|shone/sparkled]。」

だれからか、わからなかった。[心当たり|こころあたり|idea/suspicion]は いくつか あったが、[確かめる|たしかめる|to confirm]る[勇気|ゆうき|courage]が なかった。

それから[十年|じゅうねん|ten years]が[経つ|たつ|to pass (time)]った。あの[手紙|てがみ|letter]は いまも[引き出し|ひきだし|drawer]に しまってある。

[春|はる|spring]になるたびに[取り出す|とりだす|to take out]して、よむ。そして また しまう。`,
  },

  // ─── N2 ───────────────────────────────────────────────────────────────────
  {
    id: "n2-e",
    level: "N2",
    rank: "E",
    title: "境界線",
    titleEn: "The Boundary",
    genre: "slice-of-life",
    wordCount: 180,
    textEn: `Between the two of them, there was an invisible boundary line.

At the workplace they exchange smiles as colleagues. But when they leave the office, the two walk in separate directions.

Misaki found this boundary line uncomfortable. The cause was a remark made half a year ago.

"Honestly, I have some doubts about your approach to work."

The other person's words may have been a frank opinion rather than criticism. But how things are received differs from person to person.

Misunderstanding gradually deepens within silence.`,
    furigana: [["境界線","きょうかいせん"],["職場","しょくば"],["退社","たいしゃ"],["発言","はつげん"],["誤解","ごかい"],["沈黙","ちんもく"]],
    text: `ふたりの[間|あいだ|between]には、[見えない|みえない|invisible][境界線|きょうかいせん|boundary line]が あった。

[職場|しょくば|workplace]では[同僚|どうりょう|colleague]として、[笑顔|えがお|smile]で[挨拶|あいさつ|greeting]をかわす。だが、[退社|たいしゃ|leaving the office]すると、ふたりは[別々|べつべつ|separately]の[方向|ほうこう|direction]へ あるく。

ミサキは その[境界線|きょうかいせん|boundary line]が[居心地悪い|いごこちわるい|uncomfortable]く[感じる|かんじる|to feel]ていた。[原因|げんいん|cause]は[半年前|はんとしまえ|half a year ago]の、あの[発言|はつげん|remark]だ。

「[君|きみ|you (familiar)]の[仕事|しごと|work]への[取り組み方|とりくみかた|approach]、[正直|しょうじき|honestly]すこし[疑問|ぎもん|doubt/question]に おもっている。」

[相手|あいて|the other person]の[言葉|ことば|words]は[批判|ひはん|criticism]ではなく[率直|そっちょく|frank]な[意見|いけん|opinion]だったかもしれない。だが、[受け取り方|うけとりかた|how one receives]は ひとそれぞれだ。

[誤解|ごかい|misunderstanding]は、[沈黙|ちんもく|silence]のなかで だんだんと[深く|ふかく|deeply]なっていく。`,
  },
  {
    id: "n2-d",
    level: "N2",
    rank: "D",
    title: "廃墟の灯り",
    titleEn: "Light in the Ruins",
    genre: "mystery",
    wordCount: 190,
    textEn: `The ruins stood quietly on the outskirts of town. The residents wouldn't approach. Even the children avoided only that place.

But Mamoru was a journalist. Curiosity was stronger than fear.

The interior of the ruins was far more spacious than expected. Dust had piled up in the corridors and most of the window glass was broken.

Going up to the second floor, only one room had its door closed. A faint light was leaking from it.

Mamoru took a deep breath and pushed the door. Inside the room, an elderly man was lighting a candle and writing something.

"I've been waiting for you," the man said without turning around.`,
    furigana: [["廃墟","はいきょ"],["住民","じゅうみん"],["記者","きしゃ"],["廊下","ろうか"],["二階","にかい"],["扉","とびら"],["蝋燭","ろうそく"]],
    text: `その[廃墟|はいきょ|ruins]は、まちの[外れ|はずれ|outskirts]に[静かに|しずかに|quietly]たっていた。[住民|じゅうみん|residents]は[近づく|ちかづく|to approach]こうとしない。[子供|こども|children]たちも、そこだけは[避ける|さける|to avoid]けていた。

だが、マモルは[記者|きしゃ|journalist]だった。[恐れ|おそれ|fear]より[好奇心|こうきしん|curiosity]が つよかった。

[廃墟|はいきょ|ruins]の[内部|ないぶ|interior]は[予想|よそう|expectation]より ずっと[広い|ひろい|wide/spacious]かった。[廊下|ろうか|corridor]には[埃|ほこり|dust]が つもり、[窓|まど|window]の[ガラス|ガラス|glass]は[大半|たいはん|most/majority]が われていた。

[二階|にかい|second floor]へ[上がる|あがる|to go up]がると、[一室|いっしつ|one room]だけ[扉|とびら|door]が[閉まっている|しまっている|is closed]た。そこから、かすかに[光|ひかり|light]が もれていた。

マモルは[深呼吸|しんこきゅう|deep breath]して、[扉|とびら|door]を おした。[部屋|へや|room]の なかには、[老い|おい|old age]た[男性|だんせい|man]が[蝋燭|ろうそく|candle]を ともして、なにかを かいていた。

「[待って|まって|wait]いましたよ」と[男性|だんせい|man]は[振り返らず|ふりかえらず|without turning around]に いった。`,
  },
  {
    id: "n2-c",
    level: "N2",
    rank: "C",
    title: "記憶の海",
    titleEn: "Sea of Memories",
    genre: "fantasy",
    wordCount: 200,
    textEn: `Memory resembles the sea — Kai thought. Even if the surface looks calm, there is something immeasurable in the depths.

Kai's ability was to touch other people's memories. When his finger touched a subject's hand, fragments of their life came flowing in.

But it was not a blessing.

When he touched the memory of a certain girl, Kai held his breath. There was a loneliness there that exceeded imagination. A quiet despair of a kind that words cannot express.

Kai resolved: I will add light to this girl's memory.`,
    furigana: [["記憶","きおく"],["海","うみ"],["能力","のうりょく"],["断片","だんぺん"],["少女","しょうじょ"],["孤独","こどく"],["絶望","ぜつぼう"],["光","ひかり"]],
    text: `[記憶|きおく|memory]とは、[海|うみ|sea]に[似て|にて|resembling]いる——カイは そう[考えた|かんがえた|thought]。[表面|ひょうめん|surface]は おだやかに みえても、[深層|しんそう|depths]には[計り知れない|はかりしれない|immeasurable]ものが ある。

カイの[能力|のうりょく|ability]は、ひとの[記憶|きおく|memory]に[触れる|ふれる|to touch]れることだった。[指|ゆび|finger]が[対象|たいしょう|subject/target]の[手|て|hand]に ふれると、その[人生|じんせい|life]の[断片|だんぺん|fragment]が[流れ込む|ながれこむ|to flow in]んでくる。

だが、それは[祝福|しゅくふく|blessing]では なかった。

ある[少女|しょうじょ|girl]の[記憶|きおく|memory]に[触れた|ふれた|touched]とき、カイは[息|いき|breath]を[呑んだ|のんだ|swallowed]。そこには[想像|そうぞう|imagination]を[超える|こえる|to exceed]える[孤独|こどく|loneliness]が あった。[言葉|ことば|words]では[表現|ひょうげん|expression]できない[種類|しゅるい|kind/type]の、[静か|しずか|quiet]な[絶望|ぜつぼう|despair]。

カイは[決意|けつい|determination]した。この[少女|しょうじょ|girl]の[記憶|きおく|memory]に、[光|ひかり|light]を[加える|くわえる|to add]えよう、と。`,
  },
  {
    id: "n2-b",
    level: "N2",
    rank: "B",
    title: "最後の講義",
    titleEn: "The Final Lecture",
    genre: "slice-of-life",
    wordCount: 200,
    textEn: `The professor's final lecture was held without prior announcement.

"Today my class ends," the professor said quietly. "Due to illness, I will be hospitalized from next week."

The classroom fell completely silent. No one could speak.

The professor continued. "Scholarship is not about finding answers. It is about finding questions. To keep asking throughout one's whole life — that is the proof of intelligence."

When the lecture ended, applause broke out. But I couldn't applaud. Because my eyes were blurred with tears.

Those words are still a support for my research today.`,
    furigana: [["教授","きょうじゅ"],["講義","こうぎ"],["病気","びょうき"],["入院","にゅういん"],["学問","がくもん"],["知性","ちせい"],["拍手","はくしゅ"],["涙","なみだ"]],
    text: `[教授|きょうじゅ|professor]の[最後|さいご|last]の[講義|こうぎ|lecture]は、[予告|よこく|prior announcement]なしに おこなわれた。

「[今日|きょう|today]で わたしの[授業|じゅぎょう|class/lesson]は[終わり|おわり|the end]です」と、[教授|きょうじゅ|professor]は[静かに|しずかに|quietly]いった。「[病気|びょうき|illness]の ため、[来週|らいしゅう|next week]から[入院|にゅういん|hospitalization]します。」

[教室|きょうしつ|classroom]が[静まり返った|しずまりかえった|fell completely silent]。だれも[声|こえ|voice]を だせなかった。

[教授|きょうじゅ|professor]は[続けた|つづけた|continued]。「[学問|がくもん|study/scholarship]とは、[答え|こたえ|answer]を みつけることでは ありません。[問い|とい|question]を みつけることです。[一生|いっしょう|one's whole life][問い続ける|といつづける|to keep asking]]こと——それが[知性|ちせい|intelligence]の[証|あかし|proof/evidence]です。」

[講義|こうぎ|lecture]が おわると、[拍手|はくしゅ|applause]が おきた。だが、わたしは[拍手|はくしゅ|applause]できなかった。[涙|なみだ|tears]で[目|め|eyes]が かすんでいたから。

あの[言葉|ことば|words]は、いまも わたしの[研究|けんきゅう|research]の[支え|ささえ|support]に なっている。`,
  },
  {
    id: "n2-a",
    level: "N2",
    rank: "A",
    title: "断章、都市にて",
    titleEn: "Fragment, in the City",
    genre: "slice-of-life",
    wordCount: 210,
    textEn: `The city has countless stories.

While waiting at a crossroads for the light, I observe the people standing next to me. A middle-aged man in a business suit, a high school student in uniform, a woman pushing a baby carriage.

Each has their own day.

The man may have been scolded by his boss this morning. The high school student may be frightened by their exam results. The woman may have sleepless nights continuing.

But when the light turns green, everyone starts walking simultaneously. Each in their own direction.

The city may be an aggregate of intersecting loneliness.`,
    furigana: [["都市","とし"],["物語","ものがたり"],["交差点","こうさてん"],["中年","ちゅうねん"],["制服","せいふく"],["孤独","こどく"],["集合体","しゅうごうたい"]],
    text: `[都市|とし|city]には[無数|むすう|countless]の[物語|ものがたり|story]が ある。

[交差点|こうさてん|intersection]で[信号|しんごう|traffic signal]を まつあいだ、わたしは[隣|となり|beside/next to]に たつ ひとびとを[観察|かんさつ|observation]する。[背広|せびろ|business suit]を きた[中年|ちゅうねん|middle-aged]の[男性|だんせい|man]、[制服|せいふく|uniform]すがたの[高校生|こうこうせい|high school student]、[乳母車|うばぐるま|baby carriage]を おす[女性|じょせい|woman]。

それぞれに、それぞれの[一日|いちにち|one day]が ある。

[男性|だんせい|man]は[今朝|けさ|this morning][上司|じょうし|superior/boss]に[叱られた|しかられた|was scolded]かもしれない。[高校生|こうこうせい|high school student]は[試験|しけん|exam]の[結果|けっか|result]に[怯えて|おびえて|frightened]いるかもしれない。[女性|じょせい|woman]は[眠れない|ねむれない|can't sleep]よるが[続いて|つづいて|continuing]いるかもしれない。

だが、[信号|しんごう|traffic signal]が[青|あお|blue/green]に かわると、みんな[一斉|いっせい|simultaneously]に あるきだす。それぞれの[方向|ほうこう|direction]へ。

[都市|とし|city]とは、[交差|こうさ|intersection/crossing]する[孤独|こどく|loneliness]の[集合体|しゅうごうたい|aggregate/collective]なのかも しれない。`,
  },
  {
    id: "n2-s",
    level: "N2",
    rank: "S",
    title: "言葉の墓場",
    titleEn: "Graveyard of Words",
    genre: "mystery",
    wordCount: 220,
    textEn: `In the writer's study, unfinished manuscripts were piled up.

"Why do you think you became unable to write?" asked editor Aoi.

The writer answered, looking outside the window. "Because words have become lies."

Aoi couldn't grasp the meaning. "Lies?"

"When I was young, I believed I could capture truth with words. But the more I write, the further truth recedes. Are words not a wall that separates from essence, rather than a tool for approaching it?"

Silence flowed. Aoi slowly put down her pen. "Even so, I want you to write."

The writer looked at Aoi for the first time. "Why?"

"Because your lies sound like truth to me."`,
    furigana: [["作家","さっか"],["書斎","しょさい"],["原稿","げんこう"],["編集者","へんしゅうしゃ"],["言葉","ことば"],["真実","しんじつ"],["本質","ほんしつ"],["沈黙","ちんもく"]],
    text: `[作家|さっか|writer/author]の[書斎|しょさい|study/private library]には、[完成|かんせい|completion]しなかった[原稿|げんこう|manuscript]が[山積み|やまづみ|piled up]に なっていた。

「なぜ[書けなく|かけなく|unable to write]なったんだと おもいますか？」と[担当編集者|たんとうへんしゅうしゃ|responsible editor]の アオイは[尋ねた|たずねた|asked]。

[作家|さっか|writer/author]は[窓|まど|window]の そとを みながら[答えた|こたえた|answered]。「[言葉|ことば|words]が、[嘘|うそ|lie]に なってきたから。」

アオイは[意味|いみ|meaning]が[把握|はあく|grasp/understanding]できなかった。「[嘘|うそ|lie]、ですか？」

「[若い|わかい|young]ころ、わたしは[言葉|ことば|words]で[真実|しんじつ|truth]を[捕まえられる|つかまえられる|can catch]と おもっていた。だが、[書けば|かけば|if one writes]かくほど、[真実|しんじつ|truth]は[遠ざかる|とおざかる|to move away]。[言葉|ことば|words]とは[本質|ほんしつ|essence]に[近づく|ちかづく|to approach]くための[道具|どうぐ|tool]ではなく、[本質|ほんしつ|essence]から[隔てる|へだてる|to separate]てる[壁|かべ|wall]ではないか、と。」

[沈黙|ちんもく|silence]が[流れた|ながれた|flowed]。アオイは[ゆっくり|ゆっくり|slowly]と[ペン|ペン|pen]を[置いた|おいた|placed/put down]。「それでも、[書いて|かいて|writing]ほしいです。」

[作家|さっか|writer/author]は はじめて、アオイを[見た|みた|looked at]。「なぜ？」

「[あなた|あなた|you]の[嘘|うそ|lie]が、わたしには[真実|しんじつ|truth]に きこえるから。」`,
  },

  // ─── N1 ───────────────────────────────────────────────────────────────────
  {
    id: "n1-e",
    level: "N1",
    rank: "E",
    title: "余白の思想",
    titleEn: "Philosophy of Margins",
    genre: "slice-of-life",
    wordCount: 200,
    textEn: `A margin is not an absence but a possibility — I have been contemplating this proposition for many years.

In calligraphy, the trajectory of ink and the blank space are of equal value. In writing too, the unspoken portions determine the meaning of the spoken words.

Silence is not an absence. It is a filled space.

In dialogue, when a pause is intentionally inserted, it gives the other person room for thought. Haste obstructs understanding.

Do not fear the margins of life — my master said. The true meaning of those words has finally sunk in now.`,
    furigana: [["余白","よはく"],["欠如","けつじょ"],["書道","しょどう"],["墨","すみ"],["軌跡","きせき"],["沈黙","ちんもく"],["対話","たいわ"],["師","し"]],
    text: `[余白|よはく|margin/blank space]とは[欠如|けつじょ|absence/deficiency]ではなく、[可能性|かのうせい|possibility]である——この[命題|めいだい|proposition]について、わたしは[長年|ながねん|for many years][考察|こうさつ|consideration/analysis]してきた。

[書道|しょどう|calligraphy]において、[墨|すみ|ink]の[軌跡|きせき|trajectory/trail]と[余白|よはく|margin/blank space]は[等価|とうか|equal value]だ。[文章|ぶんしょう|text/writing]においても、[語られない|かたられない|unspoken]部分が、[語られた|かたられた|spoken]言葉の[意味|いみ|meaning]を[規定|きてい|regulation/specification]する。

[沈黙|ちんもく|silence]は[不在|ふざい|absence]ではない。それは[充填|じゅうてん|filling]された[空間|くうかん|space]だ。

[対話|たいわ|dialogue]において、[間|ま|pause/space]が[意図的|いとてき|intentional]に[挿入|そうにゅう|insertion]されるとき、それは[思考|しこう|thought]の[余地|よち|room/space]を[相手|あいて|the other person]に[与える|あたえる|to give]。[急ぎ|いそぎ|haste]は[理解|りかい|understanding]を[阻む|はばむ|to obstruct]。

[人生|じんせい|life]もまた、[余白|よはく|margin/blank space]を[恐れる|おそれる|to fear]な——と、わたしの[師|し|master/teacher]は いった。その[言葉|ことば|words]の[真意|しんい|true meaning/intent]が、いま ようやく[腑に落ちた|ふにおちた|finally understood]。`,
  },
  {
    id: "n1-d",
    level: "N1",
    rank: "D",
    title: "崩壊の前夜",
    titleEn: "Eve of Collapse",
    genre: "fantasy",
    wordCount: 220,
    textEn: `On the night before the kingdom fell, the chancellor advised the king.

"Your Majesty, the people's dissatisfaction has reached a critical point. Now is precisely the time to fundamentally reform policy."

The king tilted his cup and dismissed it with a laugh. "Dissatisfaction in my reign? Laughable."

The chancellor lamented inwardly — the futility of supporting a monarch whose counsel cannot reach him.

The next morning, the masses rushed to the castle gate. The king couldn't even flee from his sleeping quarters.

History repeats itself — the chancellor knew this. But knowing and being able to stop it are separate matters.`,
    furigana: [["王国","おうこく"],["宰相","さいしょう"],["陛下","へいか"],["民","たみ"],["政策","せいさく"],["君主","くんしゅ"],["民衆","みんしゅう"],["歴史","れきし"]],
    text: `[王国|おうこく|kingdom]が[滅びる|ほろびる|to perish/fall]るまえの[夜|よる|night]、[宰相|さいしょう|prime minister/chancellor]は[王|おう|king]に[進言|しんげん|counsel/advice]した。

「[陛下|へいか|Your Majesty]、[民|たみ|the people]の[不満|ふまん|dissatisfaction]は[臨界点|りんかいてん|critical point]に[達して|たっして|having reached]います。[今|いま|now]こそ[政策|せいさく|policy]を[抜本的|ばっぽんてき|radical/fundamental]に[改める|あらためる|to reform]るべきです。」

[王|おう|king]は[杯|さかずき|cup/goblet]を[傾ける|かたむける|to tilt/tip]けながら、[一笑|いっしょう|a laugh]に[付した|ふした|dismissed]。「[余|よ|I (archaic royal)]の[治世|ちせい|reign]に[不満|ふまん|dissatisfaction]とは[笑止|しょうし|laughable/absurd]。」

[宰相|さいしょう|prime minister/chancellor]は[内心|ないしん|inner feelings]で[嘆いた|なげいた|lamented]。[諫言|かんげん|remonstrance/admonition]が[届かない|とどかない|does not reach][君主|くんしゅ|ruler/monarch]を[支える|ささえる|to support]えることの[虚しさ|むなしさ|futility/emptiness]。

[翌朝|よくあさ|the next morning]、[城門|じょうもん|castle gate]に[民衆|みんしゅう|the masses/populace]が[殺到した|さっとうした|rushed/crowded]。[王|おう|king]は[寝所|ねどころ|sleeping quarters]から[逃げ|にげ|to flee]ることも できなかった。

[歴史|れきし|history]は[繰り返す|くりかえす|to repeat]——[宰相|さいしょう|prime minister/chancellor]は それを[知って|しって|knowing]いた。だが[知って|しって|knowing]いることと、[止める|とめる|to stop]めることは、[別|べつ|separate/different]の[話|はなし|matter]だ。`,
  },
  {
    id: "n1-c",
    level: "N1",
    rank: "C",
    title: "無常という美",
    titleEn: "The Beauty of Impermanence",
    genre: "slice-of-life",
    wordCount: 230,
    textEn: `Impermanence — all things change and nothing stays. This Buddhist concept is often interpreted pessimistically.

However, that is a misunderstanding — said the old Zen master.

"Cherry blossoms are beautiful because they scatter. People are not moved by a flower that blooms forever. Impermanence is the very basis of beauty."

I looked at the teacup in my hand. Fine cracks ran across the surface of the pottery. The aesthetics of wabi says that beauty dwells in imperfection.

The master continued. "Suffering and joy do not stay. Because they do not stay, what comes next arrives. Impermanence is not the structure of despair but of hope."

The tea in the teacup had somehow cooled.`,
    furigana: [["無常","むじょう"],["仏教","ぶっきょう"],["桜","さくら"],["湯飲み","ゆのみ"],["侘び","わび"],["絶望","ぜつぼう"],["希望","きぼう"]],
    text: `[無常|むじょう|impermanence]——すべてのものは[変わり|かわり|changing]、[留まる|とどまる|to stay]ことはない。この[仏教|ぶっきょう|Buddhism]の[概念|がいねん|concept]は、しばしば[悲観的|ひかんてき|pessimistic]に[解釈|かいしゃく|interpretation]される。

しかし、それは[誤解|ごかい|misunderstanding]だ——と[禅僧|ぜんそう|Zen monk]の[老師|ろうし|old master]は いった。

「[桜|さくら|cherry blossom]が[美しい|うつくしい|beautiful]のは、[散る|ちる|to fall/scatter]るからだ。[永遠|えいえん|eternity/forever]に[咲き続ける|さきつづける|blooming forever][花|はな|flower]に、[人|ひと|people]は[感動|かんどう|moved/impressed]しない。[無常|むじょう|impermanence]こそが、[美|び|beauty]の[根拠|こんきょ|basis/grounds]だ。」

わたしは[手|て|hand]もとの[湯飲み|ゆのみ|teacup]を みた。[焼き物|やきもの|pottery]の[表面|ひょうめん|surface]には[細かい|こまかい|fine/detailed]ひびが はいっている。[侘び|わび|wabi (rustic simplicity)]の[美学|びがく|aesthetics]は、[欠け|かけ|chip/flaw]にこそ[宿る|やどる|to reside/dwell]という。

[老師|ろうし|old master]は[続けた|つづけた|continued]。「[苦しみ|くるしみ|suffering]も[喜び|よろこび|joy]も、[留まらない|とどまらない|does not stay]。[留まらない|とどまらない|does not stay]から、[次|つぎ|next]が くる。[無常|むじょう|impermanence]とは、[絶望|ぜつぼう|despair]ではなく[希望|きぼう|hope]の[構造|こうぞう|structure]だ。」

[湯飲み|ゆのみ|teacup]の[お茶|おちゃ|green tea]は、いつの まにか[冷めて|さめて|had cooled]いた。`,
  },
  {
    id: "n1-b",
    level: "N1",
    rank: "B",
    title: "言語の限界",
    titleEn: "The Limits of Language",
    genre: "slice-of-life",
    wordCount: 240,
    textEn: `Wittgenstein said: "The limits of my language mean the limits of my world."

Having spent fifteen years as a translator, this proposition sinks to the bone for me.

In some languages there are words that have no equivalent in other languages. For example, the Portuguese "saudade" — an emotion that should be called an attachment to loss, different from both nostalgia and longing.

Translation is an attempt to fill this gap. But it can never be completely filled. The boundary of language is also the boundary of culture and of experience.

I study Japanese not to acquire a language. But to enter another world.`,
    furigana: [["言語","げんご"],["限界","げんかい"],["翻訳家","ほんやくか"],["語彙","ごい"],["郷愁","きょうしゅう"],["翻訳","ほんやく"],["境界","きょうかい"],["文化","ぶんか"]],
    text: `ウィトゲンシュタインは「わたしの[言語|げんご|language]の[限界|げんかい|limits]が、わたしの[世界|せかい|world]の[限界|げんかい|limits]を[意味する|いみする|to mean]」と いった。

[翻訳家|ほんやくか|translator]として[十五年|じゅうごねん|fifteen years]を[費やして|ついやして|having spent]きた[私|わたし|I/me]には、この[命題|めいだい|proposition]が[骨身|ほねみ|to the bone]に[染みる|しみる|to sink in/penetrate]。

ある[言語|げんご|language]には、[他の|ほかの|other]言語に[対応する|たいおうする|to correspond]する[語彙|ごい|vocabulary]が[存在しない|そんざいしない|does not exist]ことがある。たとえば、ポルトガル語の「saudade」——[郷愁|きょうしゅう|nostalgia]とも[憧れ|あこがれ|longing]とも[異なる|ことなる|different]、[喪失|そうしつ|loss]への[愛着|あいちゃく|attachment/affection]とでも いうべき[感情|かんじょう|emotion]。

[翻訳|ほんやく|translation]とは、この[間隙|かんげき|gap/interstice]を[埋める|うめる|to fill in]める[試み|こころみ|attempt]だ。しかし[完全|かんぜん|complete/perfect]に[埋まる|うまる|to be filled]こどはない。[言語|げんご|language]の[境界|きょうかい|boundary]は、[文化|ぶんか|culture]の[境界|きょうかい|boundary]であり、[経験|けいけん|experience]の[境界|きょうかい|boundary]でもある。

[私|わたし|I/me]が[日本語|にほんご|Japanese language]を[学ぶ|まなぶ|to learn]のは、[言語|げんご|language]を[習得|しゅうとく|acquisition/mastery]するためではない。[別の|べつの|another]世界に、[入り込む|はいりこむ|to enter/get into]むためだ。`,
  },
  {
    id: "n1-a",
    level: "N1",
    rank: "A",
    title: "夢の構造",
    titleEn: "The Architecture of Dreams",
    genre: "mystery",
    wordCount: 250,
    textEn: `Dreams have no logic — this is a misconception. Dreams have their own unique logic. It is simply that the system differs from waking logic.

As a neuroscience researcher, I spent ten years analyzing the structure of dreams. Measuring the brain waves of subjects while having them record dream content.

What became clear was the fact that dreams are constructed with emotion at the center. Memory fragments are drawn by the gravity of emotion and combined regardless of context.

Therefore dreams are a manifestation of suppressed emotions, and also a place of dialogue with the self.

One night, I tried to analyze my own dream. Looking at the records, only one emotion was being repeated — loneliness.`,
    furigana: [["夢","ゆめ"],["論理","ろんり"],["神経科学","しんけいかがく"],["研究者","けんきゅうしゃ"],["脳波","のうは"],["記憶","きおく"],["感情","かんじょう"],["孤独","こどく"]],
    text: `[夢|ゆめ|dream]には[論理|ろんり|logic]がない——これは[俗説|ぞくせつ|popular belief/misconception]だ。[夢|ゆめ|dream]には[独自|どくじ|unique/original]の[論理|ろんり|logic]がある。ただ、[覚醒|かくせい|awakening/wakefulness]時の[論理|ろんり|logic]とは[体系|たいけい|system/framework]が[異なる|ことなる|different]のだ。

[神経科学|しんけいかがく|neuroscience]の[研究者|けんきゅうしゃ|researcher]である[私|わたし|I/me]は、[夢|ゆめ|dream]の[構造|こうぞう|structure]を[解析|かいせき|analysis]することに[十年|じゅうねん|ten years]を[費やした|ついやした|spent]。[被験者|ひけんしゃ|test subject]の[脳波|のうは|brain waves]を[計測|けいそく|measurement]しながら、[夢|ゆめ|dream]の[内容|ないよう|content]を[記録|きろく|record]させる。

[判明|はんめい|becoming clear]したのは、[夢|ゆめ|dream]が[感情|かんじょう|emotion]を[中心|ちゅうしん|center]に[構築|こうちく|construction]されている という[事実|じじつ|fact]だ。[記憶|きおく|memory]の[断片|だんぺん|fragment]は[感情|かんじょう|emotion]の[引力|いんりょく|gravity/attractive force]によって[引き寄せられ|ひきよせられ|drawn toward]、[文脈|ぶんみゃく|context]とは[無関係|むかんけい|unrelated]に[結合|けつごう|combination/bonding]する。

ゆえに[夢|ゆめ|dream]は、[抑圧|よくあつ|suppression/repression]された[感情|かんじょう|emotion]の[発現|はつげん|manifestation]であり、[自己|じこ|self]との[対話|たいわ|dialogue]の[場|ば|place/occasion]でもある。

ある[夜|よる|night]、[私|わたし|I/me]は[自分|じぶん|oneself]の[夢|ゆめ|dream]を[分析|ぶんせき|analysis]しようとした。[記録|きろく|record]を みると、そこには ただ ひとつの[感情|かんじょう|emotion]だけが[反復|はんぷく|repetition]されていた——[孤独|こどく|loneliness]。`,
  },
  {
    id: "n1-s",
    level: "N1",
    rank: "S",
    title: "意識と空白",
    titleEn: "Consciousness and the Void",
    genre: "slice-of-life",
    wordCount: 260,
    textEn: `What is consciousness — this question is both the foundation of philosophy and the forefront of neuroscience.

The mind-body problem — how does the brain as matter generate subjective experience — remains unsolved even in modern times.

Descartes' "I think, therefore I am" tried to prove existence on the grounds of the certainty of thought. However, it does not answer who is doing the thinking.

Zen's koan "What is the sound of two hands clapping? Then what is the sound of one hand?" shakes consciousness in a place beyond logic. The purpose is not to seek an answer but to question itself.

The void may not be the absence of consciousness, but the place where consciousness appears in its purest form.

I closed my eyes. In the darkness, something existed.`,
    furigana: [["意識","いしき"],["哲学","てつがく"],["神経科学","しんけいかがく"],["脳","のう"],["禅","ぜん"],["公案","こうあん"],["空白","くうはく"],["純粋","じゅんすい"]],
    text: `[意識|いしき|consciousness]とは なにか——この[問|とい|question]は[哲学|てつがく|philosophy]の[根幹|こんかん|root/foundation]であり、[神経科学|しんけいかがく|neuroscience]の[最前線|さいぜんせん|forefront]でもある。

[心身|しんしん|mind and body][問題|もんだい|problem]——すなわち、[物質|ぶっしつ|matter/substance]としての[脳|のう|brain]が、いかにして[主観的|しゅかんてき|subjective][経験|けいけん|experience]を[生成|せいせい|generation/creation]するのか——は、[現代|げんだい|modern era]においても[未解決|みかいけつ|unsolved]のままだ。

デカルトの「我[思う|おもう|to think]、ゆえに我[在り|あり|to exist]」は、[思考|しこう|thought]の[確実性|かくじつせい|certainty]を[根拠|こんきょ|basis/grounds]に[存在|そんざい|existence]を[証明|しょうめい|proof]しようとした。しかし、[誰が|だれが|who][思って|おもって|thinking]いるのか、という[問|とい|question]には[答えて|こたえて|answered]いない。

[禅|ぜん|Zen]の[公案|こうあん|koan]「[両手|りょうて|both hands]の[音|おと|sound]は 何か。では[片手|かたて|one hand]の[音|おと|sound]は？」は、[論理|ろんり|logic]を[超えた|こえた|exceeded]ところで[意識|いしき|consciousness]に[揺さぶり|ゆさぶり|shaking/rocking]を かける。[答え|こたえ|answer]を[求める|もとめる|to seek]のではなく、[問う|とう|to question]こと[自体|じたい|itself]が[目的|もくてき|purpose/goal]なのだ。

[空白|くうはく|blank/void]とは、[意識|いしき|consciousness]の[不在|ふざい|absence]ではなく、[意識|いしき|consciousness]が[最も|もっとも|most][純粋|じゅんすい|pure]な[形|かたち|form]で[現れる|あらわれる|to appear]ところかもしれない。

わたしは[目|め|eyes]を[閉じた|とじた|closed]。[暗闇|くらやみ|darkness]の なかで、[何かが|なにかが|something][在った|あった|existed]。`,
  },
];

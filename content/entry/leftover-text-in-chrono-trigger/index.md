---
title: 'Revisiting the Chrono Trigger Pre-release Leftover Dialogue'
date: 2016-03-13T14:03:00+09:00
author: Ryou
images:
- img/chronotrigger_title.png
category: Disassembly / Analysis
tags:
- square
- prototype
draft: false
---

*Originally written November 2013*

Eight years ago (!), we were starting to really dig into the Chrono Trigger Pre-release Demo ROM. I was making it a project to dump all of the dialogue from this Demo version for comparison to the final. I wanted to do a full translation and hoped to find exciting differences in the story. I never finished the translation or comparison, but thankfully the Chrono Compendium [completed that project fantastically](http://www.chronocompendium.com/Term/Translated_Text_(CTP).html). While identifying the text blocks and dumping them, we found early on that there was leftover dialogue data from previous versions of the game. Unfortunately, the text was broken: the hiragana and katakana were readable but the kanji was wildly incorrect. That broken text has never been given a thorough examination, until recently when, on a whim, I picked up the project again and documented what I found...

<!--more-->

# Defining a Block

Before examining the leftover text, we need to better define what a 'block' of text is. The dialogue spans offset 0x3B0242 to 0x3B1F3F. My original research [split this up into 23 blocks](http://sudden-desu.net/ct/comp_text.html); the more-accurate Pre-release translation on the Compendium [breaks it up into 19 blocks](http://www.chronocompendium.com/Term/Translated_Text_(CTP).html). However, the actual definition of a block is nebulous in both cases. My offset ranges were chosen arbitrarily, looking for chunks of 0's and other anomalies in the hex view to delineate sections. I'm not sure of the reasoning behind the 19 block layout of the Compendium text, but it too seems arbitrarily defined.

A more logical system is to group blocks by the pointer tables that the game uses to reference each string of text. If we define a block as a range of data beginning with a pointer table immediately followed by the text data it references, we can identify 7 blocks (laid out below). Since we are defining the offsets for the pointed data, this aligns with the layout of the unpointed data as well.

# Unpointed text, part 1

As its description implies, unpointed text is text that is not referenced by a pointer table. The game software uses the pointer table to find the memory address where the specified text string is stored. Thus, unpointed data cannot be normally accessed by the code, as it has no way of being 'found.' It is essentially orphaned data.

The reason for this leftover text still exists at all is due to the nature of how games were made during that era. The developers would have used one or two test cartridges containing EEPROM chips that allowed the team to easily write the game code to the cartridge for testing on actual hardware. The data on the chips was overwritten and not wiped first, meaning if the new data was shorter than the previous data, the excess data remained.

When this process happens a few times and as the work-in-progress data changes, the excess data may form into 'layers,' like sediment, with the oldest version existing at the end, and newer (shorter) versions appearing before it. Each 'layer' of excess data is an artifact from a previous build written to the cartridge that, at one time, had a pointer table referencing down into what is now leftover data.

Let's use an imaginary line of text as an example. Let's say in our first version, we have a line reading:

```
Crono, you should go see your friend Lucca at the Millennial Fair.[00]
```

(using [00] as the marker for the end of the string) The text goes through some revisions, and the next version, the line is changed to:

```
Crono, Lucca is waiting for you at the Millennial Fair.[00]
```

This new text is a bit shorter, so when it's written to the chip, the actual data is:

```
Newest version:                                            Old ver.A
Crono, Lucca is waiting for you at the Millennial Fair.[00]nial Fair.[00]
```

The tail end of the previous version still remains. In an effort to save space, the text is reduced even more in the next version, so the data looks like this now:

```
Newest version:                  Old ver.A                    Old ver.B
Lucca is waiting at the Fair.[00]u at the Millennial Fair.[00]nial Fair.[00]
```

The unpointed blocks of text work the same way. As newer revisions were shortened, the tail ends of previous versions remained on the development chips.

# New block map

With our new definition of 'block' and the fact that the unpointed blocks are further divided by version, here's a proper layout of the text inside the Pre-release ROM:

Text data is stored in banks 59 (0x3b0000) and 60 (0x3c0000). Data between blocks is zeros.

```
    Dialogue block 01
    Pointers 0x3b0000-0x3b0241
    Text 0x3b0242-0x3b23d9
    Unpointed A 0x3B23DA-0x3B2314 (Std table)
    Unpointed B 0x3B2415-0x3B254E (Std table)
    Unpointed C 0x3B254F-0x3B25F0 (Std table)
    Dialogue block 02
    Pointers 0x3b5000-0x3b5293
    Text 0x3b5294-0x3b85e6
    Unpointed A 0x3B85E7-0x3B8C5E (Table A)
    Unpointed B 0x3B8C5F-0x3B98A3 (Table B)
    Unpointed C 0x3B98A4-0x3B990B (Table B)
    Dialogue block 03
    Pointers 0x3bb000-0x3bb3ff
    Text 0x3bb400-0x3bde35
    Unpointed A 0x3bde36-0x3bde48 (Zeroes; see notes)
    Unpointed B 0x3bde49-0x3BE4FC (Table A)
    Dialogue block 04
    Pointers 0x3c0000-0x3b0427
    Text 0x3bc0428-0x3c4535
    Dialogue block 05
    Pointers 0x3c5000-0x3c56d5
    Text 0x3c56d6-0x3cacfd
    Unpointed A 0x3cacfe-0x3CAF12 (Std table)
    Unpointed B 0x3CAF13-0x3CAFFF (Table C)
    Dialogue block 06
    Pointers 0x3cb000-0x3cb0bb
    Text 0x3cb0bc-0x3cbb6c
    Dialogue block 07
    Pointers 0x3ce000-0x3ce0ab
    Text 0x3ce0ac-0x3cee95
    Unpointed A 0x3ceea0-0x3CF6B9 (Table A)
    Treasure chest text
    Pointers 0x3cfe00-0x3cfe09
    Text 0x3cfe0a-0x3cfe26
    Substring definitions
    Pointers 0x3cff00-0x3cff3f
    Text 0x3cff40-0x3cffc0
    Unpointed A 0x3cffc1-0x3cffcc (Table A)
    Unpointed B 0x3cffcd-0x3cffce
```

# Unpointed text, part 2

As previously mentioned, the text for most of the unpointed blocks was broken. It seems that while the single-byte definitions (the hiragana, katakana, numbers, symbols and some substrings) were the same across all versions, the double-byte definitions (kanji) had changed drastically. This made the text half-readable: the kana was accurate but the kanji was wildly incorrect. In Japanese, this is like taking the key words, like nouns and verbs, out of a sentence and leaving only structure and grammar. Using an English sentence as an analogy:

```
"This is the legendary sword, the Grandleon!"
```

would look something like this:

```
"This is the [blank] [blank], the Grandleon!"
```

There are a couple of methods to decipher the broken text. The first is simply guessing. Using context clues, common Japanese language phrases and commonly used phrases in the game specifically, we can make educated guesses at some of the kanji. Needless to say, this is unreliable and frustrating, as the text is almost always just too vague to make a sound guess.

The other method involves comparing the text to its later, correct version. So long as the text remained nearly the same, we can compare it and substitute the correct kanji into the broken text. The downside of this method is that the text must remain mostly the same in later versions; text that changed significantly does not have a later comparison and thus can't be directly deciphered. Broken kanji in the drastically different blocks may be used in other, verifiable blocks, though.

# Kanji Tables

As I began to build the table for the leftover text and redump text, I noticed something: there was more than one old kanji table lurking in the leftover data! This was both an exciting and frustrating discovery. It was exciting because it was a previously unknown facet of the pre-release ROM which sheds further light on the development process. It was frustrating because the text using these even older tables was changed significantly and couldn't be compared to later versions.

The leftover text references three separate kanji tables. In the table above, you'll notice that after each unpointed block address is Std table, Table A, Table B or Table C. Std table refers to the 'standard' table used by the Pre-release version. Tables A, B and C are all definitions from previous versions.

With our knowledge of how the 'layers' of leftover data work, we can infer some facts. It's a given that the Standard table is the newest, as it is what is actually used by the software. Therefore, any unpointed text using the Standard table is newest. We can assume since there is so much data using Table A leftover that it must have been the version used right before Standard. Finally, data using tables B and C appears after Table A blocks, meaning it is older than Table A, and thus the oldest. We can't really make a sound call on whether B or C is oldest, since they are not in the same block and have no relative comparison. Logically, the standard table unpointed text has almost nothing changed; text using table A has noticeable differences; text using B or C is very different.

Table A is the most complete, as it is used by the majority of the unpointed text. Tables B and C are both very incomplete. Table B is used once (twice technically), in blocks 02-B and 02-C, and the text is completely different. Sadly, there's not a single line to compare it to, and the few entries in Table B are based on the context clues/guessing method. Table C is similar: it is used only once, but there are three or four lines of text at the end that survived to later versions. It's still mostly unreadable, but some information is better than none.

# Corrected text dumps and comparisons

After constructing the tables as best I could, I dumped each block of unpointed text and arranged it in a spreadsheet for comparison. You should refer to the spreadsheet for research, but here is an overview of each block:

## Block 1 unpointed text

Nothing too interesting here, unfortunately. It's the tail end of the text of block 1, Azala's death and the Lavos star. There are three versions, and all are identical to the final pre-text except for one extra "Ride!" in unpointed block A.

## Block 2 unpointed text

Now things get fun! Block A contains two sections of text. The first half is the dialogue from the Gran + Leon (Masa Mune) battle. There are numerous small differences. Lots of text was changed, but the plot is the same. The second half of A takes place in the dungeon of Manoria Cathedral. The captured humans have a couple different lines, but most of the text is the same.

Block B is probably the most fascinating of all the leftover text. This is the only chunk to use Table B, meaning it's very old text and it shows. It takes place very early in the game, right after meeting Marle at the fair. None of the text here exists in any later versions, and some parts of the plot seem noticeably different. There is reference to a Great King Delnach (Derunacchi in Japanese); Lucca's machine is the Teleport rather than Telepod; Bosch (Melchior) plays a bigger role early on. There are lots of intriguing points, but unfortunately, as there is no later text to compare to, all the kanji here is based entirely on guesswork. 90% of the kanji is unavailable, so many sentences are almost entirely unreadable. Still, there are lots of interesting tidbits that can be inferred.

## Block 3 unpointed text

Block A is actually nothing but zeroes. This is because Block 3 standard actually ends with a bunch of empty strings, i.e. consecutive 00's in the data. Block 3 officially ends with the last string referenced, which is at offset 0x3cacfd. After that are 18 more 0 value bytes, followed by the broken text starting mid-string. We can infer that those 18 bytes are the tail end of a previous version of block 3. Since it's all 00's, we can't assign a table to it, but that doesn't matter as it doesn't contain data. It's just an interesting, pointless leftover.

Block B contains two sections. The first is Dalton with Schala as hostage in the Earthbound village. The team has some lines that were removed, plus some small changes in Bosch's lines. The second half is Mother Brain's dialogue. Very little text actually changed, although some there was some text re-ordered in the beginning.

## Block 5 unpointed text

Block A uses the standard table and was already thoroughly covered in the Compendium Pre-release translation. The interesting part here is Block B, the only block to use Table C. It is very old text, and sadly there isn't much of it. It is set in Prehistoric times. There's an NPC named 'Gigi' who speaks, and the team makes mention of a character named Migō. There are four lines that survived, spoken by NPCs, with some minor changes.

## Block 7 unpointed text

Crono's Trial. There are no major changes, but there are a few points of interest. The number of days until execution was 7 instead of 3; King Guardia's scolding of Marle at the end is much more severe; several small grammar and kanji changes that illustrate how the byte-size of the text was a consideration in development.

So there we have it. I hope everyone finds this interesting. It was a lot of work, but it was also fascinating digital archaeology. I consider my findings mostly 'definitive,' but there may yet be some mistakes somewhere. As far as I'm concerned, the document is now 'open-source' and belongs to the old game hacking/research community, so please feel free to correct and further improve it.

[Chrono Trigger - Unpointed Dialogue Research spreadsheet (v4) - Viewable on Google Docs](https://docs.google.com/spreadsheets/d/1F2InXH-MrDpPZW-lXR3I3zPRTPfM4jIje8lXCK03COc/edit?usp=sharing)

[Chrono Trigger - Unpointed Dialogue Research spreadsheet (v4) - XLSX File](chrono-trigger-pre-release-unpointed-text-ver-4.xlsx)

I have also posted this to the [Compendium forums](http://www.chronocompendium.com/Forums/index.php?topic=10132.0) where we've begun discussing it with a bit more depth.

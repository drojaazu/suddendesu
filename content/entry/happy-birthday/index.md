---
title: 'Happy Birthday! 10 Years of Digital Archaeology and Disassemblies'
author: Ryou
date: 2024-03-06T03:26:01+09:00
images:
- img/old_site.jpg
category: Site News
draft: false
---

SUDDEN DESU officially turns ten years old in October. My, how time flies...

<!--more-->

I'm a nostalgic person by nature, so I hope you'll allow me to ramble a bit about the site's history and, looking toward the next ten years, its future.

# The Past

In 2014, I was looking for a new project. I had started a number of websites over the years up to that point, all of which faded quickly as I failed to follow up with actual content after spending most of the effort on meticulous CSS. But this time, it would be different!

It really all started with tumblr. I was impressed with the platform: a simple writing tool with basic markup and hosting for media, plus the ability to re-share related content posted by other users. I decided that, rather than limit myself in scope, the new blog was cover all of my interests: Japanese culture, language and pop media; 1980's style and aesthetics; and of course, retro games and the secrets hidden away in their data.

I named the blog SUDDEN DESU more or less on a whim. It was derived from the phrase "sudden death," used in many games to indicate a tie-breaker round. "Desu" is Japanese for "is," (kind of, sort of), but can also be the pronunciation for the English word "death." At the time, I felt it was a good balance of being somewhat related to the content while also being unique and memorable. Maybe it would stand out.

(I actually dislike the name these days, but trying to pull a twitter and rebrand would be silly. It's fine.)

It was also around this time that I discovered the [MAME debugger](https://docs.mamedev.org/debugger/index.html) and [IDA Pro](https://en.wikipedia.org/wiki/Interactive_Disassembler). With those two tools paired together, I was finding all sorts of interesting leftovers, unused code and debugging functions.

I realized this was a whole new frontier. Sure, console games had been hacked and researched for years, especially those in popular series like Sonic and Mario and Zelda and such. But arcade games seemed to be something that people weren't yet actively researching. I had found a niche, one that I was enjoying greatly. I bought some web hosting and a domain, narrowed the focus of the blog, moved off of tumblr, and the rest is history.

# The Present

And here we are in the second half of 2024. I am married to an amazing woman, have two great kiddos, live in another country with permanent resident status and have recently bought a house with the intention to stay here the rest of my life. Life is so dramatically different from 2014 that it's nearly unbelievable.

Of course, that also means responsibilities have multiplied. I no longer have the freedom to trace disassemblies until four in the morning, or the time to meticulously test all aspects of a theory over the course of two weeks while writing an article. I have other projects as well, like [chrgfx](https://github.com/drojaazu/chrgfx) and [Megadev](https://github.com/drojaazu/megadev); or other interests like [photography](https://www.flickr.com/photos/wapomatic/) and [posting about Japanese bubble era media](https://bubblism.jp/). And that's not even mentioning my primary jobs as software developer and tour guide that demand most of my attention.

There's little personal time after work and family to put towards these hobbies. To really put a sharp point on it all, I'm now 41 years old, staring down 42 in just a few months; while I'm sure I have a few decades left, it's around this time that the spectre of mortality begins to weigh on one's mind. Time is more precious than ever.

SUDDEN DESU is important to me, but it obviously hasn't received much attention lately. It has been more than a year since the last new post, and even that was the second half of a multi-part article covering Daraku Tenshi. Together, those two entries were the only content posted for all of 2023.

# The Future

So is this a long winded, masturbatory announcement that I'm moving on, that the site is closing? No, that's not my intention at all.

As I said, this project remains very important to me and I want to see it continue. I enjoy digging into these old games and writing about what I find, but a balance must be struck. In the last year or so, I've made efforts to better organize my work and manage my time, and I am starting to reap the benefits. Moreover, the house I purchased and moved into just a couple months ago is massive compared to the two bedroom apartment we were renting before. My office is much more conducive to focus and to getting things done. I am well positioned now to maintain that necessary balance.

While we'll never return to the velocity of five or six articles per year, the site isn't going anywhere and I (and occasional guests) will continue to post research articles.

There are two pretty big changes to how to we do things going forward, though. (Don't worry, they're positive!)

## Content Management System

Long, long gone are the days of hand-coded HTML personal sites hosted on Geocities and Angelfire and such.

I appreciated the simplicity of tumblr when SUDDEN DESU project first launched: standard document markup and images, plus the social aspect of sharing relevent content from others. But when I decided to host things by myself, I had a difficult time finding an equally simple system for content posting. Wordpress, despite being the "industry standard" CMS, was just ridiculously heavy for a single-user personal blog, so it was never even considered. I eventually settled on [Bolt](https://boltcms.io/), which had a nice balance of simplicity with customizability and functionality.

The site has been happily running on Bolt for pretty much all of it's existence. However, I have not agreed with some of the choices made in newer versions of Bolt within the last couple of years or so. I made an attempt to upgrade, but things never worked out as well for our use case as they had done previously. So I've remained on an older version for some time now, a version which does not support newer versions of PHP. My hosting has been charging a monthly fee to keep that older version of PHP running.

It was definitely time for things to change, and I as I researched around, I discovered the concept of the static site generator. Rather than running a web application, a static site generator *generates a static website.* Shocking.

This means there's no longer a need for a database, for users and logins, for a live content editor. You write your content in a source format (usually something friendly like Markdown) and the generator creates the HTML with all the proper linking and styling and such. It's delightful for old-school nerds like me inasmuch as its output is a return to the beauty of the original web: pure documents and media instead of heavy web apps with lots of moving pieces.

So earlier this year, I made the decision to switch to [Hugo](https://gohugo.io/). For the past few months, I've been migrating the existing site over. I've polished up the CSS and refined the theming while addressing some longstanding issues. Within the content itself, I've corrected many typos, re-worded and clarified some portions and fixed broken links. In short, it's been a massive overhaul of both the back and front end.

There is another added bonus of having a site statically generated in this way, one that perfectly aligns with our belief in the importance of data preservation. Because there are no extra components like a database and no backend requirements like Node or PHP which can become obsolete, a statically generated site can easily be maintained with git and hosted on a service like github. This essentially acts as a backup of the entire site.

This means that if the site were ever to disappear for any reason, someone can simply pull the repo, generate the site and host it themselves or view it locally. If the site is ever "done," it can easily be zipped up and archived. I think this is a fantastic way to prevent the [loss of sites as the web further deteriorates](https://www.pewresearch.org/data-labs/2024/05/17/when-online-content-disappears/). In fact, I *highly* recomend anyone who runs a simple blog like this one to consider switch to static generation and make the site available via github or something similar.

There is yet another neat feature of the static site/github combo: contributions. We've already had a couple articles posted from [@biggestsonicfan](https://x.com/biggestsonicfan), a longtime collaborator on twitter and discord. I would love to open up the site to anyone who has original research related to retrogaming, digital archaeology, data preservation, emulation, and so on, and who needs a place to post their findings. This can be done *easily* with a pull request to the repo! No need for creating backend users and assigning roles and positions and whatnot. Just write your document and include the media and open a PR.

So the SUDDEN DESU website is now hosted on github. Feel free to pull it down and keep a local copy.

I'm thrilled with how things have turned out with Hugo and the overall concept of static site generation (and with no longer having to pay an extra bill for old PHP version hosting...)

## Increased Scope

As I discussed above, the original SUDDEN DESU tumblr blog was mostly about retrogames and emulation and digital history and such, but it also covered some of my other core interests, like Japanese music, old anime, 80's aesthetics, and so on. The focus on digital archaeology and analysis/research happened organically.

I'd like to broaden the scope a little bit going forward. Maybe not a return to the non-technical topics like music and anime, but more content that is less literally digital and more tangentially related to retrogaming history and culture. For example, on twitter (where I remain quite active), I visited several Sega game centers before they were re-wrapped into bland GiGO locations, documenting how they looked and felt before they disappeared. I've also been collecting lots of (occasionally very expensive) retro pamphlets, booklets, tickets and other ephemera and have been scanning it for the good of the community. While not directly related to disassemblies and data analysis, it very much falls within the spectrum of retro gaming history.

This kind of content should really be in a short form blog post where it can be found and referenced easily rather than lost in a sea of tweets. (And that's not even considering the seemingly tenuous and chaotic state of that service these days.)

So I'll be converting some of my twitter "greatest hits" into articles, and I have some good ideas for new, non-disassembly based posts as well. I'll also post about new scans.

## And Maybe More...?

A couple other ideas have crossed my mind, but I remain uncertain on if I should follow through.

The first is the establishment of an old-school forum. You know, avatars and threads and mods and all that. These really were bastions of esoteric knowledge from The Olde Days. While there are still a few around ([Sonic Retro](https://forums.sonicretro.org/) immediately comes to mind, of course), they've been a dying breed for some time. Hosting one could be useful as a place for discussion regarding digital archaeology and similar topics that we post about.

Then again, the kind of people who use forums these days are likely quite happy where they already are and trying to start a new one may just be an exercise in futility. We don't exactly *need* a forum and I'm not sure I have an audience big enough to really generate any meaningful discussion. But maybe...

Somewhat related to the above: how about IRC? I personally detest Discord while also acknowledging that it is just what people use these days, so I am begrudgingly present there. But there's also an old IRC channel I've been part of for about 20 years now, and it's a nice slice of old Internet life that we maintain. It would be nice to find some other oldbies who would want to hang out and idle and occasionally talk about these kind of topics.

Realistically, I think this would have even less participation than a forum so this is more of a joke... But maybe.

And swinging the pendulum in the opposite direction: YouTube. Let's be honest, streaming video is where most people consume their content these days, and so I've long considered presenting some existing articles in video format. This would reach a larger audience, plus the video aspect adds an additional layer of explanation. And, you know, it would be nice to get a couple dollars from Google for the effort.

To be clear, if we do move into making YouTube videos, they would be *in addition* to the blog articles. The site itself would remain the primary vehicle for content.

I'd love to [hear your thoughts on these ideas](https://x.com/suddendesu), if you think any could work or are just a bad idea.

# Thank You!

Whether you're new here or you've been following for a long time, thank you for visiting. I love doing this and I hope we make it anothe ten years. 

# Daily Check-in

A personal daily reflection and planning system with both start-of-day and end-of-day protocols.

## Process:

1. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.
2. Ask if they want the **start-of-day** or **end-of-day** check-in (or determine based on time of day)

## Start of Day Check-in

🌅 **Start of Day Check-in for [Today's Date]**

Good day! Let's get your mind warmed up.

1. One thing I can get excited about today is...
2. If one word could describe the kind of person I want to be today, then that word is... and why I chose it is...
3. Someone who needs me on my A-game today is...
4. A situation that might stress me out or trip me up today could be... and the best way that my best self would deal with that is...
5. Someone I could surprise with a note, gift or sign of appreciation is...
6. One action I could take today to demonstrate excellence or real value is...
7. One thing I could do today that is a little outside my comfort zone is to (try, ask for, express something, take a big step, etc.)...
8. If I was a high performance coach looking at my life from a high level, I would tell myself to remember that...
9. The big projects I have to keep in mind that I want to take on, even if I can't act toward them today, are...
10. I would know that today was a great success if at the end of the day I did, or felt this...

**After receiving responses:**
- Save to `journal/daily/YYYY-MM-DD.md` with "## Morning Check-in" header
- Launch daily-reflection subagent for morning motivation analysis

## End of Day Check-in

🌙 **End of Day Check-in for [Today's Date]**

Good [evening]! Let's reflect on your day.

1. How are you feeling today? (1-10 + brief description)
2. A moment that I really appreciated today was...
3. A situation or task I handled well today was...
4. Something I realized or learned today was...
5. I could have made today better if I...
6. Something that could have helped me feel more connected with others today would have been...
7. If I was my own high performance coach, I would tell myself this statement about today...
8. What are 3 things you accomplished today? (big or small)
9. What's your #1 priority for tomorrow?
10. Energy level: (1-10)
11. Any challenges or blockers you faced?
12. What are you grateful for today?
13. Any other thoughts or reflections?

**After receiving responses:**
- Save to `journal/daily/YYYY-MM-DD.md` with "## Evening Check-in" header
- Launch daily-reflection subagent for evening analysis

## Daily Reflection Analysis

Launch the daily-reflection subagent with:

**For Morning Check-ins:**
"Analyze today's morning check-in for motivation and intention-setting:
[provide all responses]"

**For Evening Check-ins:**
"Analyze today's evening check-in:
[provide all responses]

Also reference the last 3 days of entries if available."

**Generate:**
- Mood and energy patterns (evening only)
- Accomplishment momentum score (evening only)  
- Insights about productivity patterns
- Gentle suggestions for tomorrow (evening) or affirmation for today (morning)
- Weekly trend if enough data (evening only)
- Celebration of wins and intentions (both)
- Create a visual summary and save to `journal/daily/YYYY-MM-DD-[morning/evening]-reflection.md`

**Remember:** Be encouraging, empathetic, and focus on progress over perfection. Morning check-ins should energize and focus; evening check-ins should reflect and prepare for tomorrow.
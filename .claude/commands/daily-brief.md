# Daily News Brief

A personalized news briefing system that learns your interests and finds current, relevant news.

## Process:

### Stage 1: Interest Analysis
1. **File Analysis**: Scan key repository files to understand user interests
2. **Launch Interest Analyzer**: 
```
Analyze these files to identify the user's interests and focus areas:
[Provide content from key files: CLAUDE.md, aboutme.md, recent journal entries, 
trading business files, client tracking files, personal development files]

Extract:
- Professional interests and expertise areas
- Business focus areas and industries
- Personal development topics
- Geographic interests (Dubai, Middle East, etc.)
- Technology and tools they use
- Current projects and goals
- Learning areas and skill development

Create interest categories with relevance scores.
```

### Stage 2: Current News Search & Curation
3. **Launch News Curator** with interest analysis results:
```
Based on these identified interests, find and curate current news from the LAST 7 DAYS ONLY:
[Provide interest analysis results]

CRITICAL REQUIREMENTS:
- Use web search with date filters for past 7 days only
- Verify all publication dates before including any story
- Include exact publication date for every item
- Explain relevance to user's specific interests
- Suggest actionable next steps
- Focus on stories that could impact their work, trading, or personal goals

Categories to search:
- [Dynamic based on interest analysis]
- AI/Technology trends
- Financial markets and trading
- Business coaching and consulting
- Middle East business news
- Personal development and productivity
```

4. **Briefing Compilation**: Create comprehensive daily brief with:
   - Executive summary of key themes
   - Categorized news with relevance explanations
   - Action items and opportunities
   - Market implications (for trading)
   - Business development opportunities

### Stage 3: Save and Deliver
5. **Save Results**: Create timestamped brief in `news-briefs/YYYY-MM-DD-daily-brief.md`
6. **Summary**: Highlight top 3 most relevant stories and suggested actions

## File Structure:
- Create `news-briefs/` directory if needed
- Save briefs as: `news-briefs/YYYY-MM-DD-daily-brief.md`

## Quality Controls:
- ALL news must be from the past 7 days
- Every story must include publication date
- Relevance explanation required for each item
- No speculation or outdated information
- Focus on actionable intelligence

## Briefing Format:
```
# Daily News Brief - [Date]

## 🎯 Executive Summary
[Top 3 themes affecting your interests today]

## 📈 Your Interest Areas Today
### [Category 1] - [Relevance Score]
**Story Title** - *Published: [Date]*
- **Why this matters to you**: [Specific relevance]
- **Potential action**: [What you could do]

### [Category 2] - [Relevance Score]
[Continue format...]

## 🚀 Opportunities Identified
[Actions you could take based on today's news]

## 📊 Market/Business Implications
[Relevant for trading and business coaching work]
```

Remember: Current, verified, actionable news only!
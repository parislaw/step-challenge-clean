# Brain Dump Analysis

A comprehensive system for extracting insights from stream-of-consciousness writing.

## Process:

1. **Initial Setup**: Check for braindumps folder, create if needed
2. **File Discovery**: Scan braindumps/ directory for all text/markdown files
3. **Content Gathering**: Read and compile all brain dump files chronologically
4. **Two-Stage Analysis**:

### Stage 1: Insight Extraction
Launch the insight-extractor subagent with:
```
Analyze these brain dumps for deep patterns and insights:
[provide all brain dump content with timestamps/filenames]

Extract:
- Recurring themes and patterns across all entries
- Evolution of thinking over time
- Hidden connections between seemingly unrelated ideas
- Key questions that keep appearing
- Breakthrough moments and realizations
- Emotional patterns and triggers
- Core values and beliefs that emerge
- Growth areas and challenges identified

Use the person's exact words and phrases when highlighting insights.
```

### Stage 2: Visual Analysis & Action Items
Launch the brain-dump-analyst subagent with:
```
Create comprehensive visual analysis of these insights:
[provide insight-extractor results + original brain dumps]

Generate:
- ASCII mind map of thought connections
- Top 10 realizations in exact user words
- Thinking evolution timeline
- Action items mentioned or implied
- Content creation opportunities (for creators)
- Visual representations with emojis and formatting
- Celebration of growth and breakthrough moments

Make everything visually engaging and actionable.
```

3. **Save Results**: Create timestamped analysis file in braindumps/analysis/
4. **Summary**: Provide key highlights and next steps

## File Naming Convention:
- Analysis files: `braindumps/analysis/YYYY-MM-DD-brain-analysis.md`
- Include both personal insights and content opportunities

## Goals:
- Reveal patterns the user can't see themselves
- Show how ideas connect and evolve over time
- Extract actionable wisdom from chaotic thoughts
- Celebrate thinking and personal growth
- Transform insights into opportunities
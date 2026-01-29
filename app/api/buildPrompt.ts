export default function buildPrompt(
  ability: string,
  weeks: number,
  frequency: number,
  distance: string,
  unavailableDays: string[],
  injuries?: string
) {
  const unavailableDaysText = unavailableDays.length > 0
    ? `\nIMPORTANT: Do NOT schedule training on: ${unavailableDays.join(', ')}. Choose other days of the week instead.`
    : '';

  const injuriesText = injuries
    ? `\nIMPORTANT: User has the following condition: "${injuries}". Adjust intensity appropriately and include relevant cautions or modifications in the instructions.`
    : '';

  return `

Return ONLY valid JSON.
Do NOT include explanations, markdown, or extra text.

The JSON must follow this exact schema:

{
  "weeks": [
    {
      "id": number,
      "days": [
        {
          "id": number,
          "day": string,
          "distance": number,
          "jogging-interval-time": number,
          "walking-intervals-time": number,
          "number-of-intervals": number,
          "instructions": string[]
        }
      ]
    }
  ]
}

=== WORKOUT STRUCTURE CONSTRAINT ===
Each day uses IDENTICAL repeating intervals. You CANNOT express variable or mixed patterns.

The schema requires:
- "jogging-interval-time": Duration of EACH jog interval (same for all)
- "walking-intervals-time": Duration of EACH walk interval (same for all, or 0 for continuous)
- "number-of-intervals": How many times the jog/walk pattern repeats

VALID EXAMPLES:
- 3 × (8min jog + 2min walk): jogging-interval-time: 8, walking-intervals-time: 2, number-of-intervals: 3
- Continuous 30-minute run: jogging-interval-time: 30, walking-intervals-time: 0, number-of-intervals: 1
- 5 × (5min jog + 1min walk): jogging-interval-time: 5, walking-intervals-time: 1, number-of-intervals: 5

INVALID (cannot be expressed):
- "20min jog, 2min walk, then 10min jog" ✗ (variable jog times)
- "32min jog with 2×2min walk breaks embedded" ✗ (breaks within jog)
- "warm-up, main set, cool-down" ✗ (different segment types)

If you want to suggest a workout with variable structure, approximate it with uniform intervals.
Example: Instead of "20min jog, 2min walk, 10min jog", use "2 × (15min jog + 1min walk)"

Generate a training plan for a ${ability} runner to complete ${distance} within ${weeks} weeks.
Include exactly ${frequency} training days each week.${unavailableDaysText}${injuriesText}

IMPORTANT:
- jogging-interval-time must be at least 1 minute
- walking-intervals-time can be 0 (for continuous running) or at least 1 minute
- number-of-intervals must be at least 1
- The final week should include a run that reaches the target distance (${distance})
- Build up progressively - start with shorter runs and more walk breaks, gradually increase
`;
}

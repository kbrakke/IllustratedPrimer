# Test Story Prompts - Princess Nell

These are sample story opening prompts used during development of the original Next.js implementation. They can be used to test the AI story generation quality.

## Princess Nell Opening Variations

1. Princess Nell was known throughout the kingdom for her wit and intelligence.

2. Once upon a time, there was a princess named Nell who could outsmart anyone.

3. In a far-off land, there lived a princess named Nell who was the cleverest person in the realm.

4. Nell was a princess unlike any other - her quick thinking and sharp mind were unmatched.

5. The kingdom of Arden had never seen a princess quite like Nell, whose intelligence was the talk of the town.

6. They say that Princess Nell could solve any problem, no matter how difficult.

7. When it came to puzzles and riddles, Princess Nell was always one step ahead.

8. Nell was a princess who never backed down from a challenge, using her cleverness to overcome any obstacle.

9. The people of the kingdom admired Princess Nell for her intelligence and cunning.

10. Princess Nell's sharp mind and quick wit were her greatest weapons, and she used them to protect her kingdom from harm.

## Usage

These prompts can be used to:

1. **Test AI consistency**: See if responses maintain character traits
2. **Benchmark performance**: Measure response quality across different models
3. **Compare implementations**: Verify Rust TUI produces similar quality to Next.js
4. **Training examples**: Show users how to start engaging stories

## Inspired By

These prompts are inspired by "The Diamond Age" by Neal Stephenson, where the Young Lady's Illustrated Primer adapts stories for the child's learning level.

## Testing in Rust TUI

\`\`\`bash
cargo run --release

# 1. Select user
# 2. Press 'n' to create new story
# 3. Enter title: "Princess Nell's Adventure"
# 4. Paste one of the prompts above
# 5. Observe AI response quality and consistency
\`\`\`

## Expected AI Behavior

A good response should:
- Continue the chosen theme (intelligence, wit, problem-solving)
- Use age-appropriate language (ages 2-8)
- Introduce a challenge or learning opportunity
- Engage the child with questions
- Maintain narrative consistency

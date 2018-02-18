probScores :: [(Float, Float)]
probScores = [
    (0.5, 1 / 24),
    (0.3, 1 / 6),
    (0.1, 7 / 24),
    ((-0.1), 7 / 24),
    ((-0.3), 1 / 6),
    ((-0.5), 1 / 24)
  ]

probability :: Int -> Float
probability cutoff
  = calculate cutoff 0 0

calculate :: Int -> Int -> Float -> Float 
calculate cutoff attempts score
  | score <= (-0.5)    = 0
  | score >= (0.5)     = 1
  | attempts == cutoff = 0
  | otherwise          = sum probs
  where
    probs = map (\(s, p) -> p * calculate cutoff (attempts + 1) (score + s)) probScores

cutoffProbabilities :: [(Int, Float)]
cutoffProbabilities
  = zip [1..10] $ map probability [1..10]

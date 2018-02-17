TuneFactor uses your music tastes to present a 2-factor authentication challenge that only you can pass. It takes 2-factor authentication to the next level - authenticating a user based on their behaviour, rather than a code from a text message or app.

## How we compare

&nbsp; | Authenticator App | TuneFactor
---|---|---
tough to hack | &check; | &check;
tough to steal | &cross; | &check;
no second device required | &cross; | &check;
fast | &cross; | &check;
enjoyable | &cross; | &check;

## Under the bonnet

- On a system where TuneFactor is used, the user has to link their account with their Spotify account (the algorithm is easily extensible to other music sources and datasets too).
- Once the user logs in, the program picks three songs and tries to predict the order the user will rank them in. The user then ranks the songs.
- The program stores an internal probability of how likely the user is to be who they say they are. This probability is affected by the user's ranking of the songs.
  - If the probability is judged insufficient by the program, the user is asked to rank the songs again.
  - If the probability is high enough, the user is logged in.
  - If the probability is too low or there have been too many attempts, the user is locked out.

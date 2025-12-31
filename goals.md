1. Meny
    [] map
    [] bolån
    [] hem
2. UX

Normalize property data

Notes & reactions

Phase 2

Economy calculator

Comparison view

Property status

Phase 3

BRF insights

Commute analysis

Long-term cost projections


At the beginning, let's start witht the beginning, let's start with just pasting URLs. When we pasted a URL, we checked the response for the OG titles and have them saved in a list (small image). On the right side, the URL that is shortened by a, and of course if you full URL can be there, but otherwise that that that that and some info from the og titles. You can share this with some friend, so maybe search other friends by name or by nickname. 
Got it! So you want **private shared spaces** where only specific people can see the links.

**Updated plan:**
1. Supabase login/auth
2. Create **shared spaces** (e.g. "My Partner", "Travel Buddies")
3. Invite specific friends to each space (by username/nickname)
4. Paste URLs in a space → fetch OG metadata
5. Only members of that space see those links

**Data structure:**
- Spaces (with members list)
- Links (belong to a space)
- Users can be in multiple spaces

Plan and data structure implementation need to be tested and updated to know where we are in the project.


UX

After clicking "Add link," there will be processes that get back either some short
info or some more detailed info about the object. It's two different end points.


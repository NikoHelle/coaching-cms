# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coaching-cms is personal tool for creating football / soccer drills that can be bundled in to training sessions. It is essential to share these session publicly to players before training.

## Tech Stack

- React + Node.js
- Supabase + PostGRE
- Code in Github, deploy to Vercel

## Contents

### Drill

Each drill has

- title
- description
- purpose
- player count
- video links to Instagram / Youtube, that are embedded to website when rendered
- duration
- focus points
- dos and dont's
- tags (clicking them, lists drills for that tag)
- status: public | draft
- shareable url without login requirements

### Session

Each session has

Multiple drills picked in UI.

- shareable url without login requirements

### Session list

Each session is listed on home page

### Drill editor

Crude, can be an existing framework. Private tool, no need to be fancy.

### Drill/session renderer

These are public, so should be very good looking. Priority is mobile first.

## Design Context

### Users

Adult amateur footballers on a Finnish team, opening session links from the
team chat on their phones — at home the night before training or at
pitch-side in daylight. The job: quickly see what tonight's training is, what
each drill looks like (video), and the coach's focus points. Admin UI stays
deliberately plain; design effort goes to the public pages.

### Brand Personality

Playful, warm, sporty. Sunday-league football among friends: training is
play, not work. Not childish, not corporate. Finnish copy, lightly playful.

### Aesthetic Direction

Light theme only (sun-readable outdoors). Amateur-football material world as
the design vocabulary: grass pitch, chalk lines, training cones, bibs, jersey
numbers, tactics board. Playfulness through color, shape, and detail — not
goofy letterforms. Anti-references: generic SaaS pages, dark "gamer" sports
apps, children's-app cuteness. Body font is Manrope by explicit choice — do
not replace it; display/heading typography may be added around it.

### Design Principles

1. Pitch-side legibility first — sunlight-readable contrast beats decoration.
2. Football materials, not football clichés — grass green, cone orange, chalk
   white; numbered drills like jersey numbers; no stock photos or gradients.
3. Playful in the details, calm in the structure — personality lives in
   headings, badges, numbers, empty states, and the 404.
4. The session page is the product — judge every design decision there first.
5. Nothing slows the pitch-side glance — no heavy media or blocking motion.

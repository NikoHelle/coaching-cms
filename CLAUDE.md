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

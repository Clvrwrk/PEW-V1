#!/usr/bin/env python3
"""
generate_silo_posts.py — Pro Exteriors Reverse Silo Blog Post Generator

Reads API keys from project .env, calls OpenRouter for copy, Hue Write for humanization,
then builds HTML files from the blog-article template for every reverse-silo supporter post.

Usage:
    python3 generate_silo_posts.py [--silo SILO_KEY] [--post SLUG] [--skip-images]
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# ─── PATHS ─────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path("/sessions/beautiful-adoring-cannon/mnt/Pro Exteriors Website")
CONTENT_DIR  = PROJECT_ROOT / "content" / "blog"
TEMPLATE_FILE = PROJECT_ROOT / "design/templates/blog-article/blog-article-enhanced.html"
ENV_FILE = PROJECT_ROOT / ".env"

HERO_IMAGES = {
    # Per-silo hero images (Higgsfield cinematic_studio_2_5, 16:9, generated 2026-05-04)
    "commercial-roof-repair":       "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015541_07bb7086-0085-48a2-b4e4-bc7f1197bd4c.png",
    "commercial-roof-replacement":  "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015544_009bfdad-a926-4d03-a45f-ef3e8e79742b.png",
    "commercial-roof-maintenance":  "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015547_ef754c68-f861-4215-82e5-8b93cf9a8780.png",
    "commercial-roof-inspection":   "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015550_b68186ff-43cb-4860-8f56-b3abab09c55f.png",
    "new-construction-roofing":     "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015558_8ad1ca71-927b-4faa-aa47-9e6bba3c5321.png",
    "metal-roofing":                "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015601_0a44d82f-3282-471b-8c96-9b38832a1e8d.png",
    "residential-roof-replacement": "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015604_d718a3a0-3029-4e59-9dc2-3ee0d2f08a0b.png",
    "emergency-roof-repair":        "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015607_71713d7a-5d70-47a9-84ae-55c97b1c5a1b.png",
    "storm-damage-restoration":     "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015658_959f9d0f-a022-4b36-b356-79901934e35d.png",
    "residential-roof-repair":      "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015701_b01a0532-4b93-4654-9b0c-a94cd9107b6c.png",
    "residential-roof-inspection":  "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015704_6aa7c86b-bc2d-4ae4-a9c0-e6728c022a3a.png",
    # Legacy category fallbacks
    "commercial": "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015541_07bb7086-0085-48a2-b4e4-bc7f1197bd4c.png",
    "metal":      "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015601_0a44d82f-3282-471b-8c96-9b38832a1e8d.png",
    "residential":"https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015604_d718a3a0-3029-4e59-9dc2-3ee0d2f08a0b.png",
    "storm":      "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_015607_71713d7a-5d70-47a9-84ae-55c97b1c5a1b.png",
    "solar":      "https://d8j0ntlcm91z4.cloudfront.net/user_39x0gEMb1MLod699FtUNJLdewUD/hf_20260504_012926_9e8ba868-5308-4be4-b982-bbef4a17797e_min.webp",
}

# ─── ALL 55 SILO POSTS ─────────────────────────────────────────────────────
# Structure: { silo_key: { pillar_title, pillar_slug, pillar_keyword, image_key, posts: [...] } }
SILOS = {
    # ─── COMMERCIAL SILO 1: ROOF REPAIR ───────────────────────────────────
    "commercial-roof-repair": {
        "pillar_title": "Commercial Roof Repair",
        "pillar_slug": "/services/commercial-roof-repair/",
        "pillar_keyword": "commercial roof repair",
        "image_key": "commercial",
        "vertical": "commercial",
        "posts": [
            {
                "slug": "emergency-commercial-roof-leak-response",
                "title": "Emergency Commercial Roof Leak Response: What Facility Managers Need to Do in the First 24 Hours",
                "meta_desc": "A step-by-step protocol for facility managers when a commercial roof fails mid-operation — minimize damage, document correctly, and get the right contractor on-site fast.",
                "target_keyword": "emergency commercial roof repair",
                "audience": "commercial facility managers and property owners",
                "intent": "emergency / urgent",
                "word_count": 1100,
                "h2s": ["The First 30 Minutes: Contain the Damage", "Who to Call and in What Order", "What to Tell Your Roofing Contractor", "Documentation Before, During, and After", "Temporary Repairs vs. Permanent Fixes"],
                "cta_text": "Get Emergency Roof Service",
                "cta_link": "/services/commercial-roof-repair/",
                "internal_links": [
                    {"anchor": "commercial roof repair", "url": "/services/commercial-roof-repair/"},
                    {"anchor": "flat roof repair methods", "url": "/blog/flat-roof-repair-methods-explained/"},
                ],
                "related": [
                    {"title": "Common Causes of Commercial Roof Damage", "url": "/blog/common-causes-commercial-roof-damage/", "img_key": "commercial"},
                    {"title": "Roof Repair vs. Replacement: Decision Guide", "url": "/blog/roof-repair-vs-replacement-decision-guide/", "img_key": "commercial"},
                    {"title": "How Insurance Claims Work for Roof Repair", "url": "/blog/how-insurance-claims-work-roof-repair/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "common-causes-commercial-roof-damage",
                "title": "7 Common Causes of Commercial Roof Damage — and How to Catch Them Early",
                "meta_desc": "Ponding water, membrane shrinkage, improper drainage — here are the seven failure modes that account for most commercial roof claims, with inspection triggers for each.",
                "target_keyword": "commercial roof damage",
                "audience": "commercial property owners and facility managers",
                "intent": "informational / research",
                "word_count": 1200,
                "h2s": ["1. Ponding Water and Drainage Failure", "2. Membrane Shrinkage and Splitting", "3. Flashing Failures at Penetrations", "4. Foot Traffic Damage", "5. HVAC Equipment Vibration", "6. Storm Impact (Hail, Wind, Debris)", "7. Deferred Maintenance Compounding"],
                "cta_text": "Schedule a Commercial Roof Inspection",
                "cta_link": "/services/commercial-roof-repair/",
                "internal_links": [
                    {"anchor": "commercial roof repair", "url": "/services/commercial-roof-repair/"},
                    {"anchor": "emergency roof leak response", "url": "/blog/emergency-commercial-roof-leak-response/"},
                ],
                "related": [
                    {"title": "Emergency Commercial Roof Leak Response", "url": "/blog/emergency-commercial-roof-leak-response/", "img_key": "commercial"},
                    {"title": "Flat Roof Repair Methods Explained", "url": "/blog/flat-roof-repair-methods-explained/", "img_key": "commercial"},
                    {"title": "Roof Repair vs. Replacement Decision Guide", "url": "/blog/roof-repair-vs-replacement-decision-guide/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "roof-repair-vs-replacement-decision-guide",
                "title": "Roof Repair vs. Replacement: The Decision Framework for Commercial Properties",
                "meta_desc": "When does patching stop making financial sense? A cost-analysis framework for commercial property owners weighing repair against full replacement.",
                "target_keyword": "commercial roof repair vs replacement",
                "audience": "commercial property owners and CFOs",
                "intent": "decision / comparison",
                "word_count": 1300,
                "h2s": ["The 50% Rule: When Repair Becomes Replacement", "Cost Per Square Foot: Repair vs. New System", "Life Expectancy and Warranty Implications", "Insurance and Claim Considerations", "The Hidden Costs of Repeated Repairs", "How to Get an Honest Assessment"],
                "cta_text": "Request a Commercial Roof Assessment",
                "cta_link": "/services/commercial-roof-repair/",
                "internal_links": [
                    {"anchor": "commercial roof repair", "url": "/services/commercial-roof-repair/"},
                    {"anchor": "common causes of commercial roof damage", "url": "/blog/common-causes-commercial-roof-damage/"},
                ],
                "related": [
                    {"title": "Common Causes of Commercial Roof Damage", "url": "/blog/common-causes-commercial-roof-damage/", "img_key": "commercial"},
                    {"title": "Commercial Roof Replacement Cost Guide", "url": "/blog/commercial-roof-replacement-cost-guide/", "img_key": "commercial"},
                    {"title": "How Insurance Claims Work for Roof Repair", "url": "/blog/how-insurance-claims-work-roof-repair/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "flat-roof-repair-methods-explained",
                "title": "Flat Roof Repair Methods Explained: TPO, EPDM, Modified Bitumen, and Built-Up Systems",
                "meta_desc": "Not all flat roof repairs are the same. A material-by-material breakdown of the correct repair technique for each commercial membrane system.",
                "target_keyword": "flat roof repair methods",
                "audience": "facility managers and commercial property owners",
                "intent": "informational / how-to",
                "word_count": 1200,
                "h2s": ["TPO Membrane: Heat-Weld vs. Lap-Seal Repairs", "EPDM: Patch Bonding and Seam Re-Adhesion", "Modified Bitumen: Torch-Down Repair Process", "Built-Up Roofing: Flood Coat and Aggregate Patching", "When Spot Repairs Won't Hold", "Choosing a Contractor for Your System"],
                "cta_text": "Talk to a Flat Roof Specialist",
                "cta_link": "/services/commercial-roof-repair/",
                "internal_links": [
                    {"anchor": "commercial roof repair", "url": "/services/commercial-roof-repair/"},
                    {"anchor": "emergency commercial roof leak response", "url": "/blog/emergency-commercial-roof-leak-response/"},
                ],
                "related": [
                    {"title": "Emergency Commercial Roof Leak Response", "url": "/blog/emergency-commercial-roof-leak-response/", "img_key": "commercial"},
                    {"title": "Common Causes of Commercial Roof Damage", "url": "/blog/common-causes-commercial-roof-damage/", "img_key": "commercial"},
                    {"title": "Roof Repair vs. Replacement Decision Guide", "url": "/blog/roof-repair-vs-replacement-decision-guide/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "how-insurance-claims-work-roof-repair",
                "title": "How Insurance Claims Work for Commercial Roof Repair",
                "meta_desc": "From filing to payout: a commercial property owner's guide to navigating the insurance claim process for roof damage — without leaving money on the table.",
                "target_keyword": "commercial roof insurance claim",
                "audience": "commercial property owners and facility managers",
                "intent": "informational / how-to",
                "word_count": 1100,
                "h2s": ["What Commercial Roof Policies Actually Cover", "How to Document Damage Before the Adjuster Arrives", "Working with the Insurance Adjuster", "Supplemental Claims: Getting the Full Scope Covered", "Choosing Between ACV and RCV Policies", "When to Bring in a Public Adjuster"],
                "cta_text": "Get Expert Claim Guidance",
                "cta_link": "/services/commercial-roof-repair/",
                "internal_links": [
                    {"anchor": "commercial roof repair", "url": "/services/commercial-roof-repair/"},
                    {"anchor": "roof repair vs replacement decision", "url": "/blog/roof-repair-vs-replacement-decision-guide/"},
                ],
                "related": [
                    {"title": "Roof Repair vs. Replacement Decision Guide", "url": "/blog/roof-repair-vs-replacement-decision-guide/", "img_key": "commercial"},
                    {"title": "Common Causes of Commercial Roof Damage", "url": "/blog/common-causes-commercial-roof-damage/", "img_key": "commercial"},
                    {"title": "Emergency Commercial Roof Leak Response", "url": "/blog/emergency-commercial-roof-leak-response/", "img_key": "commercial"},
                ],
            },
        ],
    },

    # ─── COMMERCIAL SILO 2: ROOF REPLACEMENT ──────────────────────────────
    "commercial-roof-replacement": {
        "pillar_title": "Commercial Roof Replacement",
        "pillar_slug": "/services/commercial-roof-replacement/",
        "pillar_keyword": "commercial roof replacement",
        "image_key": "commercial",
        "vertical": "commercial",
        "posts": [
            {
                "slug": "how-long-does-commercial-roof-last",
                "title": "How Long Does a Commercial Roof Last? Lifespans by System Type",
                "meta_desc": "TPO, EPDM, modified bitumen, metal — a data-driven breakdown of commercial roofing system lifespans, what accelerates degradation, and when to start planning for replacement.",
                "target_keyword": "how long does a commercial roof last",
                "audience": "commercial property owners and asset managers",
                "intent": "informational / research",
                "word_count": 1200,
                "h2s": ["TPO: 20–30 Years Under the Right Conditions", "EPDM: The Longevity Leader at 25–30 Years", "Modified Bitumen: 15–20 Years with Proper Maintenance", "Metal Roofing: 40–60 Years but at What Cost?", "What Actually Shortens Roof Life", "Planning the Replacement Cycle"],
                "cta_text": "Get a Commercial Roof Replacement Estimate",
                "cta_link": "/services/commercial-roof-replacement/",
                "internal_links": [
                    {"anchor": "commercial roof replacement", "url": "/services/commercial-roof-replacement/"},
                    {"anchor": "TPO vs EPDM vs PVC membrane comparison", "url": "/blog/tpo-vs-epdm-vs-pvc-membrane-comparison/"},
                ],
                "related": [
                    {"title": "TPO vs EPDM vs PVC: Which Membrane?", "url": "/blog/tpo-vs-epdm-vs-pvc-membrane-comparison/", "img_key": "commercial"},
                    {"title": "Signs Your Commercial Roof Needs Replacing", "url": "/blog/signs-commercial-roof-needs-replacing/", "img_key": "commercial"},
                    {"title": "Commercial Roof Replacement Cost Guide", "url": "/blog/commercial-roof-replacement-cost-guide/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "tpo-vs-epdm-vs-pvc-membrane-comparison",
                "title": "TPO vs. EPDM vs. PVC: Which Commercial Roofing Membrane Is Right for Your Building?",
                "meta_desc": "A side-by-side technical comparison of the three dominant single-ply membrane systems — installation cost, energy performance, weld strength, and 20-year lifecycle cost.",
                "target_keyword": "TPO vs EPDM vs PVC roofing",
                "audience": "commercial property owners, facility managers, and procurement officers",
                "intent": "comparison / decision",
                "word_count": 1400,
                "h2s": ["The Case for TPO: Energy Efficiency at a Mid-Range Price", "EPDM: The Proven Workhorse for Low-Slope Applications", "PVC: Premium Performance in Chemical-Exposure Environments", "Side-by-Side: Cost, Lifespan, and R-Value", "Climate Matters: Which System Performs Best in Texas Heat?", "The Decision Framework"],
                "cta_text": "Talk to a Membrane Specialist",
                "cta_link": "/services/commercial-roof-replacement/",
                "internal_links": [
                    {"anchor": "commercial roof replacement", "url": "/services/commercial-roof-replacement/"},
                    {"anchor": "how long commercial roofs last", "url": "/blog/how-long-does-commercial-roof-last/"},
                ],
                "related": [
                    {"title": "How Long Does a Commercial Roof Last?", "url": "/blog/how-long-does-commercial-roof-last/", "img_key": "commercial"},
                    {"title": "Commercial Roof Replacement Cost Guide", "url": "/blog/commercial-roof-replacement-cost-guide/", "img_key": "commercial"},
                    {"title": "What to Expect During a Commercial Re-Roof", "url": "/blog/what-to-expect-commercial-re-roof/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "commercial-roof-replacement-cost-guide",
                "title": "Commercial Roof Replacement Cost Guide: What You'll Actually Pay Per Square Foot",
                "meta_desc": "Real cost data for commercial roof replacement in Texas, Colorado, and the Midwest — broken down by system type, building size, and complexity factors that most quotes don't explain.",
                "target_keyword": "commercial roof replacement cost",
                "audience": "commercial property owners and CFOs",
                "intent": "informational / research",
                "word_count": 1300,
                "h2s": ["The Honest Cost Range: $5–$18 Per Square Foot", "Cost by System: TPO, EPDM, Metal, Modified Bitumen", "What Drives the Price Up (and What You Can Control)", "Tear-Off vs. Overlay: The Hidden Cost Decision", "How to Evaluate a Contractor Bid", "Financing and Capital Planning Options"],
                "cta_text": "Request a Detailed Replacement Quote",
                "cta_link": "/services/commercial-roof-replacement/",
                "internal_links": [
                    {"anchor": "commercial roof replacement", "url": "/services/commercial-roof-replacement/"},
                    {"anchor": "TPO vs EPDM vs PVC comparison", "url": "/blog/tpo-vs-epdm-vs-pvc-membrane-comparison/"},
                ],
                "related": [
                    {"title": "TPO vs EPDM vs PVC: Which Membrane?", "url": "/blog/tpo-vs-epdm-vs-pvc-membrane-comparison/", "img_key": "commercial"},
                    {"title": "Signs Your Commercial Roof Needs Replacing", "url": "/blog/signs-commercial-roof-needs-replacing/", "img_key": "commercial"},
                    {"title": "What to Expect During a Commercial Re-Roof", "url": "/blog/what-to-expect-commercial-re-roof/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "signs-commercial-roof-needs-replacing",
                "title": "8 Signs Your Commercial Roof Needs Replacement — Not Just Repair",
                "meta_desc": "Persistent leaks after repairs, significant membrane shrinkage, failed insulation — eight indicators that tell you the roof has reached end-of-life and repair money is being wasted.",
                "target_keyword": "signs commercial roof needs replacing",
                "audience": "commercial property owners and facility managers",
                "intent": "informational / diagnostic",
                "word_count": 1100,
                "h2s": ["1. Leaks That Keep Coming Back After Repair", "2. Membrane Shrinkage Beyond 10%", "3. Saturated Insulation", "4. Structural Deck Damage", "5. More Than 25% of the Surface Has Been Repaired", "6. The System Has Exceeded Its Design Life", "7. Energy Bills Are Climbing Without Explanation", "8. Your Insurance Carrier Is Flagging It"],
                "cta_text": "Get an End-of-Life Assessment",
                "cta_link": "/services/commercial-roof-replacement/",
                "internal_links": [
                    {"anchor": "commercial roof replacement", "url": "/services/commercial-roof-replacement/"},
                    {"anchor": "commercial roof replacement cost", "url": "/blog/commercial-roof-replacement-cost-guide/"},
                ],
                "related": [
                    {"title": "Commercial Roof Replacement Cost Guide", "url": "/blog/commercial-roof-replacement-cost-guide/", "img_key": "commercial"},
                    {"title": "How Long Does a Commercial Roof Last?", "url": "/blog/how-long-does-commercial-roof-last/", "img_key": "commercial"},
                    {"title": "What to Expect During a Commercial Re-Roof", "url": "/blog/what-to-expect-commercial-re-roof/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "what-to-expect-commercial-re-roof",
                "title": "What to Expect During a Commercial Re-Roof: A Project Manager's Timeline",
                "meta_desc": "From pre-construction planning to final punch list — a week-by-week walkthrough of a commercial re-roofing project, with checklists for minimizing business disruption.",
                "target_keyword": "commercial re-roofing process",
                "audience": "commercial property owners and facility managers",
                "intent": "informational / how-to",
                "word_count": 1200,
                "h2s": ["Pre-Project: Site Assessment and Scheduling", "Week 1: Tear-Off and Deck Inspection", "Week 2: Insulation and Substrate Preparation", "Week 3–4: Membrane Installation and Flashing", "Week 5: Final Inspection and Punch List", "Managing Business Disruption During a Re-Roof"],
                "cta_text": "Start Your Re-Roofing Planning",
                "cta_link": "/services/commercial-roof-replacement/",
                "internal_links": [
                    {"anchor": "commercial roof replacement", "url": "/services/commercial-roof-replacement/"},
                    {"anchor": "signs your roof needs replacing", "url": "/blog/signs-commercial-roof-needs-replacing/"},
                ],
                "related": [
                    {"title": "Signs Your Commercial Roof Needs Replacing", "url": "/blog/signs-commercial-roof-needs-replacing/", "img_key": "commercial"},
                    {"title": "Commercial Roof Replacement Cost Guide", "url": "/blog/commercial-roof-replacement-cost-guide/", "img_key": "commercial"},
                    {"title": "TPO vs EPDM vs PVC: Which Membrane?", "url": "/blog/tpo-vs-epdm-vs-pvc-membrane-comparison/", "img_key": "commercial"},
                ],
            },
        ],
    },

    # ─── COMMERCIAL SILO 3: ROOF MAINTENANCE ──────────────────────────────
    "commercial-roof-maintenance": {
        "pillar_title": "Commercial Roof Maintenance Program",
        "pillar_slug": "/services/commercial-roof-maintenance/",
        "pillar_keyword": "commercial roof maintenance",
        "image_key": "commercial",
        "vertical": "commercial",
        "posts": [
            {
                "slug": "preventive-roof-maintenance-checklist",
                "title": "The Commercial Roof Preventive Maintenance Checklist: What to Inspect Every Season",
                "meta_desc": "A facility manager's seasonal inspection checklist for commercial roofing systems — drains, flashings, penetrations, membrane conditions, and post-storm protocols.",
                "target_keyword": "commercial roof maintenance checklist",
                "audience": "facility managers and property maintenance directors",
                "intent": "informational / how-to",
                "word_count": 1200,
                "h2s": ["Spring: Post-Winter Damage Assessment", "Summer: Heat Stress and HVAC Interaction Points", "Fall: Pre-Storm Season Preparation", "After Every Significant Weather Event", "What to Photograph and Document", "When to Escalate to a Professional"],
                "cta_text": "Set Up a Maintenance Program",
                "cta_link": "/services/commercial-roof-maintenance/",
                "internal_links": [
                    {"anchor": "commercial roof maintenance program", "url": "/services/commercial-roof-maintenance/"},
                    {"anchor": "how often commercial roofs should be inspected", "url": "/blog/how-often-should-commercial-roof-be-inspected/"},
                ],
                "related": [
                    {"title": "How Often Should a Commercial Roof Be Inspected?", "url": "/blog/how-often-should-commercial-roof-be-inspected/", "img_key": "commercial"},
                    {"title": "Storm Season Prep for Commercial Roofs", "url": "/blog/storm-season-prep-commercial-roofs/", "img_key": "storm"},
                    {"title": "Extending Your Roof's Lifespan", "url": "/blog/extending-roof-lifespan/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "how-often-should-commercial-roof-be-inspected",
                "title": "How Often Should a Commercial Roof Be Inspected? A Data-Driven Answer",
                "meta_desc": "Industry standards say twice a year. Here's why that's a minimum — and what the actual data says about inspection frequency, claim prevention, and roof lifespan.",
                "target_keyword": "how often should a commercial roof be inspected",
                "audience": "facility managers and commercial property owners",
                "intent": "informational / FAQ",
                "word_count": 1000,
                "h2s": ["The NRCA Baseline: Twice a Year Isn't Optional", "After Hail, High Winds, or Severe Weather", "When You Have HVAC or Penetration Work Done", "Before and After Warranty Claims", "What an Inspection Actually Covers", "In-House vs. Professional Inspection"],
                "cta_text": "Schedule a Professional Inspection",
                "cta_link": "/services/commercial-roof-maintenance/",
                "internal_links": [
                    {"anchor": "commercial roof maintenance", "url": "/services/commercial-roof-maintenance/"},
                    {"anchor": "preventive maintenance checklist", "url": "/blog/preventive-roof-maintenance-checklist/"},
                ],
                "related": [
                    {"title": "Preventive Roof Maintenance Checklist", "url": "/blog/preventive-roof-maintenance-checklist/", "img_key": "commercial"},
                    {"title": "What's Included in a Roof Maintenance Plan?", "url": "/blog/roof-maintenance-plans-whats-included/", "img_key": "commercial"},
                    {"title": "Extending Your Roof's Lifespan", "url": "/blog/extending-roof-lifespan/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "roof-maintenance-plans-whats-included",
                "title": "Commercial Roof Maintenance Plans: What's Actually Included (and What to Watch For)",
                "meta_desc": "Not all maintenance contracts are equal. A breakdown of what a real commercial roof maintenance plan covers — and the exclusion clauses that can void your warranty.",
                "target_keyword": "commercial roof maintenance plan",
                "audience": "commercial property owners and procurement officers",
                "intent": "informational / buyer education",
                "word_count": 1100,
                "h2s": ["Inspection and Reporting: The Minimum Baseline", "Preventive Repairs: What's Covered vs. What's Extra", "Emergency Response Provisions", "Warranty Compliance Requirements", "Common Exclusions That Surprise Owners", "How to Compare Maintenance Contract Bids"],
                "cta_text": "Review Our Maintenance Program",
                "cta_link": "/services/commercial-roof-maintenance/",
                "internal_links": [
                    {"anchor": "commercial roof maintenance", "url": "/services/commercial-roof-maintenance/"},
                    {"anchor": "how often roofs should be inspected", "url": "/blog/how-often-should-commercial-roof-be-inspected/"},
                ],
                "related": [
                    {"title": "How Often Should a Commercial Roof Be Inspected?", "url": "/blog/how-often-should-commercial-roof-be-inspected/", "img_key": "commercial"},
                    {"title": "Preventive Roof Maintenance Checklist", "url": "/blog/preventive-roof-maintenance-checklist/", "img_key": "commercial"},
                    {"title": "Extending Your Roof's Lifespan", "url": "/blog/extending-roof-lifespan/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "storm-season-prep-commercial-roofs",
                "title": "Storm Season Prep for Commercial Roofs: The Pre-Season Protocol That Protects Your Asset",
                "meta_desc": "Texas, Colorado, and Midwest storm seasons are predictable. Here's how facility managers prepare commercial roofing systems before severe weather arrives — and what it costs not to.",
                "target_keyword": "storm season commercial roof preparation",
                "audience": "facility managers and commercial property owners in Texas and the Midwest",
                "intent": "informational / how-to",
                "word_count": 1100,
                "h2s": ["The Window Before Storm Season Opens", "Drainage Systems: The Highest-Priority Check", "Flashing and Penetration Integrity", "Membrane Surface Condition Assessment", "HVAC Unit Anchor Points", "Emergency Response Plan: Is Your Contractor Ready?"],
                "cta_text": "Book Your Pre-Storm Inspection",
                "cta_link": "/services/commercial-roof-maintenance/",
                "internal_links": [
                    {"anchor": "commercial roof maintenance program", "url": "/services/commercial-roof-maintenance/"},
                    {"anchor": "preventive maintenance checklist", "url": "/blog/preventive-roof-maintenance-checklist/"},
                ],
                "related": [
                    {"title": "Preventive Roof Maintenance Checklist", "url": "/blog/preventive-roof-maintenance-checklist/", "img_key": "commercial"},
                    {"title": "Emergency Commercial Roof Leak Response", "url": "/blog/emergency-commercial-roof-leak-response/", "img_key": "commercial"},
                    {"title": "Common Causes of Commercial Roof Damage", "url": "/blog/common-causes-commercial-roof-damage/", "img_key": "storm"},
                ],
            },
            {
                "slug": "extending-roof-lifespan",
                "title": "Extending Your Commercial Roof's Lifespan: What Works, What Doesn't, and the Numbers",
                "meta_desc": "Reflective coatings, timely repairs, proper drainage — a data-backed guide to the maintenance interventions that measurably extend commercial roof life and the ones that don't.",
                "target_keyword": "extend commercial roof lifespan",
                "audience": "commercial property owners and asset managers",
                "intent": "informational / research",
                "word_count": 1200,
                "h2s": ["The Baseline: What Industry Data Says About Roof Lifespan", "Coating Systems: Real Extension or Marketing?", "The ROI of Fixing Small Issues Fast", "Drainage: The Single Highest-Impact Variable", "Insulation Integrity and Thermal Performance", "Building the Case for Board Approval"],
                "cta_text": "Get a Lifespan Assessment",
                "cta_link": "/services/commercial-roof-maintenance/",
                "internal_links": [
                    {"anchor": "commercial roof maintenance", "url": "/services/commercial-roof-maintenance/"},
                    {"anchor": "how often roofs should be inspected", "url": "/blog/how-often-should-commercial-roof-be-inspected/"},
                ],
                "related": [
                    {"title": "How Often Should a Commercial Roof Be Inspected?", "url": "/blog/how-often-should-commercial-roof-be-inspected/", "img_key": "commercial"},
                    {"title": "Preventive Roof Maintenance Checklist", "url": "/blog/preventive-roof-maintenance-checklist/", "img_key": "commercial"},
                    {"title": "Roof Maintenance Plans: What's Included?", "url": "/blog/roof-maintenance-plans-whats-included/", "img_key": "commercial"},
                ],
            },
        ],
    },

    # ─── COMMERCIAL SILO 4: ROOF INSPECTION ───────────────────────────────
    "commercial-roof-inspection": {
        "pillar_title": "Commercial Roof Inspection",
        "pillar_slug": "/services/commercial-roof-inspection/",
        "pillar_keyword": "commercial roof inspection",
        "image_key": "commercial",
        "vertical": "commercial",
        "posts": [
            {
                "slug": "what-happens-during-roof-inspection",
                "title": "What Actually Happens During a Commercial Roof Inspection",
                "meta_desc": "A step-by-step walkthrough of what a qualified commercial roof inspector does — from pre-visit documentation review to the post-inspection report your team actually needs.",
                "target_keyword": "commercial roof inspection process",
                "audience": "facility managers and commercial property owners",
                "intent": "informational / how-to",
                "word_count": 1100,
                "h2s": ["Pre-Visit: Document Review and Site Prep", "The Exterior Perimeter Walk", "Drainage Points: Drains, Scuppers, Gutters", "Membrane and Surface Condition", "Penetrations, Flashings, and Edge Metal", "The Inspection Report: What You Should Receive"],
                "cta_text": "Schedule a Commercial Roof Inspection",
                "cta_link": "/services/commercial-roof-inspection/",
                "internal_links": [
                    {"anchor": "commercial roof inspection", "url": "/services/commercial-roof-inspection/"},
                    {"anchor": "infrared vs visual inspections", "url": "/blog/infrared-vs-visual-roof-inspections/"},
                ],
                "related": [
                    {"title": "Infrared vs. Visual Roof Inspections", "url": "/blog/infrared-vs-visual-roof-inspections/", "img_key": "commercial"},
                    {"title": "How to Read a Roof Inspection Report", "url": "/blog/how-to-read-roof-inspection-report/", "img_key": "commercial"},
                    {"title": "Roof Inspection Before Property Purchase", "url": "/blog/roof-inspection-before-property-purchase/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "infrared-vs-visual-roof-inspections",
                "title": "Infrared vs. Visual Commercial Roof Inspections: When Each Method Is the Right Call",
                "meta_desc": "Infrared thermography finds what visual inspections miss — saturated insulation, moisture intrusion, delamination. Here's when to pay for the upgrade and when it's overkill.",
                "target_keyword": "infrared roof inspection",
                "audience": "facility managers and commercial property owners",
                "intent": "comparison / decision",
                "word_count": 1100,
                "h2s": ["How Infrared Thermography Works on a Roof", "What Infrared Finds That Visual Inspection Misses", "When Visual Inspection Is Sufficient", "When Infrared Is Non-Negotiable", "Cost Comparison: Visual vs. Thermographic Survey", "How to Interpret an Infrared Roof Report"],
                "cta_text": "Book an Infrared Roof Survey",
                "cta_link": "/services/commercial-roof-inspection/",
                "internal_links": [
                    {"anchor": "commercial roof inspection", "url": "/services/commercial-roof-inspection/"},
                    {"anchor": "what happens during a roof inspection", "url": "/blog/what-happens-during-roof-inspection/"},
                ],
                "related": [
                    {"title": "What Happens During a Roof Inspection?", "url": "/blog/what-happens-during-roof-inspection/", "img_key": "commercial"},
                    {"title": "How to Read a Roof Inspection Report", "url": "/blog/how-to-read-roof-inspection-report/", "img_key": "commercial"},
                    {"title": "Compliance Inspections for Commercial Buildings", "url": "/blog/compliance-inspections-commercial-buildings/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "how-to-read-roof-inspection-report",
                "title": "How to Read a Commercial Roof Inspection Report Without a Contractor Degree",
                "meta_desc": "Condition ratings, priority levels, photo documentation, cost estimates — what every field in a professional roof inspection report means and how to act on the findings.",
                "target_keyword": "roof inspection report",
                "audience": "facility managers and commercial property owners",
                "intent": "informational / how-to",
                "word_count": 1000,
                "h2s": ["Report Structure: What a Good Report Looks Like", "Condition Ratings and What They Mean", "Priority Tiers: Immediate, Short-Term, Long-Term", "Reading the Photo Documentation", "Cost Estimate Sections: What's Usually Missing", "Questions to Ask Your Inspector After the Report"],
                "cta_text": "Get a Thorough Inspection Report",
                "cta_link": "/services/commercial-roof-inspection/",
                "internal_links": [
                    {"anchor": "commercial roof inspection", "url": "/services/commercial-roof-inspection/"},
                    {"anchor": "what happens during a roof inspection", "url": "/blog/what-happens-during-roof-inspection/"},
                ],
                "related": [
                    {"title": "What Happens During a Roof Inspection?", "url": "/blog/what-happens-during-roof-inspection/", "img_key": "commercial"},
                    {"title": "Infrared vs. Visual Roof Inspections", "url": "/blog/infrared-vs-visual-roof-inspections/", "img_key": "commercial"},
                    {"title": "Roof Inspection Before Property Purchase", "url": "/blog/roof-inspection-before-property-purchase/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "roof-inspection-before-property-purchase",
                "title": "Commercial Roof Inspection Before Property Purchase: What Buyers Need to Know",
                "meta_desc": "A commercial roof in poor condition can mean $500K+ in deferred capital. Here's how to structure the pre-purchase roof inspection, what to require in the report, and how to negotiate.",
                "target_keyword": "commercial roof inspection before purchase",
                "audience": "commercial real estate buyers and investors",
                "intent": "informational / buyer education",
                "word_count": 1100,
                "h2s": ["Why a Standard Property Inspection Isn't Enough", "Engaging a Roofing Specialist vs. a General Inspector", "The Five Things to Require in a Pre-Purchase Roof Report", "Using the Inspection in Price Negotiation", "Capital Reserve Planning Based on Report Findings", "Red Flags That Should Pause a Deal"],
                "cta_text": "Order a Pre-Purchase Roof Inspection",
                "cta_link": "/services/commercial-roof-inspection/",
                "internal_links": [
                    {"anchor": "commercial roof inspection", "url": "/services/commercial-roof-inspection/"},
                    {"anchor": "how to read a roof inspection report", "url": "/blog/how-to-read-roof-inspection-report/"},
                ],
                "related": [
                    {"title": "How to Read a Roof Inspection Report", "url": "/blog/how-to-read-roof-inspection-report/", "img_key": "commercial"},
                    {"title": "Infrared vs. Visual Roof Inspections", "url": "/blog/infrared-vs-visual-roof-inspections/", "img_key": "commercial"},
                    {"title": "How Long Does a Commercial Roof Last?", "url": "/blog/how-long-does-commercial-roof-last/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "compliance-inspections-commercial-buildings",
                "title": "Compliance Inspections for Commercial Buildings: What Triggers One and What to Expect",
                "meta_desc": "Insurance renewals, municipal permits, investor due diligence — the scenarios that require a formal roof compliance inspection and how to prepare your facility.",
                "target_keyword": "commercial building roof compliance inspection",
                "audience": "commercial property owners and facility managers",
                "intent": "informational / compliance",
                "word_count": 1000,
                "h2s": ["Insurance-Mandated Inspections: What Triggers Them", "Municipal Permit and Code Compliance", "Pre-Financing and Investor Due Diligence", "What a Compliance Inspection Covers vs. a Standard Inspection", "Preparing Your Facility for a Compliance Inspection", "Responding to a Failed Inspection"],
                "cta_text": "Schedule a Compliance Inspection",
                "cta_link": "/services/commercial-roof-inspection/",
                "internal_links": [
                    {"anchor": "commercial roof inspection", "url": "/services/commercial-roof-inspection/"},
                    {"anchor": "infrared vs visual roof inspections", "url": "/blog/infrared-vs-visual-roof-inspections/"},
                ],
                "related": [
                    {"title": "Infrared vs. Visual Roof Inspections", "url": "/blog/infrared-vs-visual-roof-inspections/", "img_key": "commercial"},
                    {"title": "What Happens During a Roof Inspection?", "url": "/blog/what-happens-during-roof-inspection/", "img_key": "commercial"},
                    {"title": "How to Read a Roof Inspection Report", "url": "/blog/how-to-read-roof-inspection-report/", "img_key": "commercial"},
                ],
            },
        ],
    },

    # ─── COMMERCIAL SILO 5: NEW CONSTRUCTION ──────────────────────────────
    "new-construction-roofing": {
        "pillar_title": "New Construction Commercial Roofing",
        "pillar_slug": "/services/new-construction-roofing/",
        "pillar_keyword": "new construction commercial roofing",
        "image_key": "commercial",
        "vertical": "commercial",
        "posts": [
            {
                "slug": "choosing-roofing-system-new-build",
                "title": "Choosing a Roofing System for a New Commercial Build: The Specification Decision Tree",
                "meta_desc": "TPO, metal, modified bitumen, or PVC — a structural engineer's perspective on matching roofing system specifications to building type, climate, and occupancy requirements.",
                "target_keyword": "commercial roofing systems for new construction",
                "audience": "general contractors, architects, and commercial developers",
                "intent": "informational / decision",
                "word_count": 1200,
                "h2s": ["The Specification Decision Tree", "Low-Slope vs. Steep-Slope: Starting with Pitch", "Climate and UV Exposure: Texas vs. Colorado Requirements", "Occupancy Type: Manufacturing, Retail, Office, Warehouse", "Energy Code Compliance and Reflectivity Requirements", "Coordination with the Structural and MEP Teams"],
                "cta_text": "Spec a Roofing System for Your Project",
                "cta_link": "/services/new-construction-roofing/",
                "internal_links": [
                    {"anchor": "new construction commercial roofing", "url": "/services/new-construction-roofing/"},
                    {"anchor": "metal vs membrane for new construction", "url": "/blog/metal-vs-membrane-new-construction/"},
                ],
                "related": [
                    {"title": "Metal vs. Membrane for New Construction", "url": "/blog/metal-vs-membrane-new-construction/", "img_key": "metal"},
                    {"title": "Roof Design Considerations for Warehouses", "url": "/blog/roof-design-considerations-warehouses/", "img_key": "commercial"},
                    {"title": "Energy-Efficient Roofing for New Buildings", "url": "/blog/energy-efficient-roofing-new-buildings/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "roof-design-considerations-warehouses",
                "title": "Roof Design Considerations for Commercial Warehouses and Distribution Centers",
                "meta_desc": "A high-bay warehouse roof faces unique loads: HVAC weight, forklift door penetrations, solar arrays, drainage across 500,000+ sq ft. What the spec needs to account for.",
                "target_keyword": "warehouse roof design",
                "audience": "warehouse developers, general contractors, and facility managers",
                "intent": "informational / technical",
                "word_count": 1200,
                "h2s": ["Dead Loads: HVAC, Solar, and Equipment Weight", "Drainage Design for Large Footprint Roofs", "Fire Code Compliance for Warehouses", "Forklift Door and Dock Penetration Detailing", "Insulation and Temperature Control for Cold Storage", "Speed-to-Occupy: Phased Construction and Schedule Alignment"],
                "cta_text": "Consult on Your Warehouse Roof Spec",
                "cta_link": "/services/new-construction-roofing/",
                "internal_links": [
                    {"anchor": "new construction commercial roofing", "url": "/services/new-construction-roofing/"},
                    {"anchor": "choosing a roofing system for new build", "url": "/blog/choosing-roofing-system-new-build/"},
                ],
                "related": [
                    {"title": "Choosing a Roofing System for New Build", "url": "/blog/choosing-roofing-system-new-build/", "img_key": "commercial"},
                    {"title": "Metal vs. Membrane for New Construction", "url": "/blog/metal-vs-membrane-new-construction/", "img_key": "metal"},
                    {"title": "Energy-Efficient Roofing for New Buildings", "url": "/blog/energy-efficient-roofing-new-buildings/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "metal-vs-membrane-new-construction",
                "title": "Metal vs. Membrane Roofing for New Commercial Construction: A 40-Year Cost Analysis",
                "meta_desc": "Metal costs more upfront and lasts twice as long. Membrane costs less now and requires replacement at year 20. Here's the 40-year NPV calculation both options are hiding from you.",
                "target_keyword": "metal vs membrane roofing new construction",
                "audience": "commercial developers, CFOs, and general contractors",
                "intent": "comparison / decision",
                "word_count": 1300,
                "h2s": ["The Upfront Cost Gap: Metal vs. TPO", "Lifespan: 40 Years vs. 20 Years", "Maintenance Cost Difference Over 40 Years", "The 40-Year NPV Calculation", "Energy Performance and LEED Credit Implications", "When Membrane Still Makes Sense Over Metal"],
                "cta_text": "Get a System Comparison for Your Project",
                "cta_link": "/services/new-construction-roofing/",
                "internal_links": [
                    {"anchor": "new construction commercial roofing", "url": "/services/new-construction-roofing/"},
                    {"anchor": "choosing a roofing system for new build", "url": "/blog/choosing-roofing-system-new-build/"},
                ],
                "related": [
                    {"title": "Choosing a Roofing System for New Build", "url": "/blog/choosing-roofing-system-new-build/", "img_key": "commercial"},
                    {"title": "Roof Design Considerations for Warehouses", "url": "/blog/roof-design-considerations-warehouses/", "img_key": "commercial"},
                    {"title": "TPO vs EPDM vs PVC: Which Membrane?", "url": "/blog/tpo-vs-epdm-vs-pvc-membrane-comparison/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "working-with-general-contractors-roofing-timeline",
                "title": "Working with General Contractors on Roofing Timelines: What Subcontractors Need to Know",
                "meta_desc": "Late structural steel, HVAC delays, weather holds — how roofing subcontractors navigate GC-managed schedules, protect their scope, and avoid being the last trade blamed for a delay.",
                "target_keyword": "commercial roofing timeline general contractor",
                "audience": "roofing contractors, project managers, and general contractors",
                "intent": "informational / how-to",
                "word_count": 1100,
                "h2s": ["When Roofing Fits in the Construction Sequence", "Substrate Readiness: What Must Happen Before We Start", "Weather Windows: Building Schedule Flexibility Into the Plan", "The Pre-Roofing Meeting: What to Cover and Document", "Change Orders and Scope Creep on New Construction", "Warranty Activation and Commissioning"],
                "cta_text": "Coordinate Your Roofing Scope",
                "cta_link": "/services/new-construction-roofing/",
                "internal_links": [
                    {"anchor": "new construction commercial roofing", "url": "/services/new-construction-roofing/"},
                    {"anchor": "roof design considerations for warehouses", "url": "/blog/roof-design-considerations-warehouses/"},
                ],
                "related": [
                    {"title": "Roof Design Considerations for Warehouses", "url": "/blog/roof-design-considerations-warehouses/", "img_key": "commercial"},
                    {"title": "Choosing a Roofing System for New Build", "url": "/blog/choosing-roofing-system-new-build/", "img_key": "commercial"},
                    {"title": "Energy-Efficient Roofing for New Buildings", "url": "/blog/energy-efficient-roofing-new-buildings/", "img_key": "commercial"},
                ],
            },
            {
                "slug": "energy-efficient-roofing-new-buildings",
                "title": "Energy-Efficient Roofing for New Commercial Buildings: What the Spec Needs to Include",
                "meta_desc": "Cool roofs, continuous insulation, air barrier integration — a specification guide for developers targeting energy code compliance and long-term operating cost reduction.",
                "target_keyword": "energy efficient commercial roofing",
                "audience": "commercial developers, architects, and sustainability directors",
                "intent": "informational / specification",
                "word_count": 1200,
                "h2s": ["IECC and ASHRAE 90.1: What the Code Requires", "Reflectivity and Emittance: The Cool Roof Standard", "Continuous Insulation: R-Value Targets by Climate Zone", "Air Barrier Integration and Vapor Management", "Green Roof and Vegetative Systems: When They Make Sense", "LEED Credits Available Through Roofing Specification"],
                "cta_text": "Spec an Energy-Efficient Roof System",
                "cta_link": "/services/new-construction-roofing/",
                "internal_links": [
                    {"anchor": "new construction commercial roofing", "url": "/services/new-construction-roofing/"},
                    {"anchor": "metal vs membrane for new construction", "url": "/blog/metal-vs-membrane-new-construction/"},
                ],
                "related": [
                    {"title": "Metal vs. Membrane for New Construction", "url": "/blog/metal-vs-membrane-new-construction/", "img_key": "metal"},
                    {"title": "Choosing a Roofing System for New Build", "url": "/blog/choosing-roofing-system-new-build/", "img_key": "commercial"},
                    {"title": "Roof Design Considerations for Warehouses", "url": "/blog/roof-design-considerations-warehouses/", "img_key": "commercial"},
                ],
            },
        ],
    },

    # ─── METAL ROOFING SILO (MONTH 2) ─────────────────────────────────────
    "metal-roofing": {
        "pillar_title": "Metal Roofing",
        "pillar_slug": "/services/metal-roofing/",
        "pillar_keyword": "metal roofing",
        "image_key": "metal",
        "vertical": "commercial",
        "posts": [
            {
                "slug": "metal-roof-installation-guide",
                "title": "Metal Roof Installation: A Complete Guide for Commercial and Residential Properties",
                "meta_desc": "Standing seam, exposed fastener, snap-lock — how each metal roofing system gets installed, what the quality checkpoints are, and what separates a 40-year install from a 15-year one.",
                "target_keyword": "metal roof installation",
                "audience": "commercial property owners and residential homeowners researching metal roofing",
                "intent": "informational / how-to",
                "word_count": 1300,
                "h2s": ["Standing Seam: The Premium System", "Exposed Fastener Panels: Commercial Workhorse", "Snap-Lock vs. Mechanical Seam: The Technical Difference", "Substrate Preparation and Underlayment", "Flashing, Trim, and Edge Details That Determine Longevity", "Quality Checkpoints During Installation"],
                "cta_text": "Get a Metal Roof Installation Estimate",
                "cta_link": "/services/metal-roofing/",
                "internal_links": [
                    {"anchor": "metal roofing", "url": "/services/metal-roofing/"},
                    {"anchor": "types of metal roofs", "url": "/blog/types-of-metal-roofs/"},
                ],
                "related": [
                    {"title": "Types of Metal Roofs", "url": "/blog/types-of-metal-roofs/", "img_key": "metal"},
                    {"title": "Metal Roof Cost Guide", "url": "/blog/metal-roof-cost-guide/", "img_key": "metal"},
                    {"title": "Metal vs. Asphalt Shingles: The Full Comparison", "url": "/blog/metal-roof-vs-asphalt-shingles/", "img_key": "metal"},
                ],
            },
            {
                "slug": "metal-shingles-guide",
                "title": "Metal Shingles: Everything You Need to Know Before You Commit",
                "meta_desc": "Metal shingles look like asphalt, last like metal, and cost more than both. A clear-eyed guide to whether they're worth it — and which profiles hold up best in hail country.",
                "target_keyword": "metal shingles",
                "audience": "residential homeowners considering metal roofing",
                "intent": "informational / buyer education",
                "word_count": 1100,
                "h2s": ["What Metal Shingles Actually Are", "Profiles: Shake, Slate, Tile, and Shingle Styles", "How They Perform in Hail Storms vs. Asphalt", "Installation Differences vs. Standing Seam", "The True Cost Comparison Over 30 Years", "What to Ask Your Contractor Before Signing"],
                "cta_text": "Get a Metal Shingle Quote",
                "cta_link": "/services/metal-roofing/",
                "internal_links": [
                    {"anchor": "metal roofing", "url": "/services/metal-roofing/"},
                    {"anchor": "metal roof installation guide", "url": "/blog/metal-roof-installation-guide/"},
                ],
                "related": [
                    {"title": "Metal Roof Installation Guide", "url": "/blog/metal-roof-installation-guide/", "img_key": "metal"},
                    {"title": "Metal vs. Asphalt Shingles", "url": "/blog/metal-roof-vs-asphalt-shingles/", "img_key": "metal"},
                    {"title": "Types of Metal Roofs", "url": "/blog/types-of-metal-roofs/", "img_key": "metal"},
                ],
            },
            {
                "slug": "metal-roof-cost-guide",
                "title": "Metal Roof Cost Guide: What You'll Pay Per Square Foot in 2025",
                "meta_desc": "Steel, aluminum, copper, zinc — metal roofing costs vary by 400%. Here's the honest breakdown by material, profile, and installation complexity, with real ranges for Texas and the Midwest.",
                "target_keyword": "metal roof cost",
                "audience": "homeowners and commercial property owners researching metal roofing",
                "intent": "informational / research",
                "word_count": 1200,
                "h2s": ["The Wide Range: $7–$25 Per Square Foot Installed", "Cost by Metal Type: Steel, Aluminum, Copper, Zinc", "Cost by Profile: Standing Seam vs. Exposed Fastener vs. Shingles", "What Drives the Price Up on Complex Roofs", "The 30-Year Cost Comparison vs. Asphalt", "How to Get an Accurate Quote"],
                "cta_text": "Get a Metal Roof Quote",
                "cta_link": "/services/metal-roofing/",
                "internal_links": [
                    {"anchor": "metal roofing", "url": "/services/metal-roofing/"},
                    {"anchor": "metal roof vs asphalt shingles comparison", "url": "/blog/metal-roof-vs-asphalt-shingles/"},
                ],
                "related": [
                    {"title": "Metal vs. Asphalt Shingles: Full Comparison", "url": "/blog/metal-roof-vs-asphalt-shingles/", "img_key": "metal"},
                    {"title": "Metal Roof Installation Guide", "url": "/blog/metal-roof-installation-guide/", "img_key": "metal"},
                    {"title": "Types of Metal Roofs", "url": "/blog/types-of-metal-roofs/", "img_key": "metal"},
                ],
            },
            {
                "slug": "types-of-metal-roofs",
                "title": "Types of Metal Roofs: A Clear Guide to Every System and When to Use Each",
                "meta_desc": "Standing seam, R-panel, corrugated, metal shingles, Galvalume, aluminum — what each system is, where it excels, and which applications it should never be specified for.",
                "target_keyword": "types of metal roofs",
                "audience": "commercial property owners, developers, and homeowners",
                "intent": "informational / educational",
                "word_count": 1100,
                "h2s": ["Standing Seam: The Architectural Standard", "Exposed Fastener / R-Panel: Commercial and Agricultural", "Corrugated Metal: Agricultural and Accent Applications", "Metal Shingles: Residential Aesthetic Option", "Material Types: Galvalume, Galvanized, Aluminum, Copper", "Matching System Type to Application"],
                "cta_text": "Talk to a Metal Roofing Specialist",
                "cta_link": "/services/metal-roofing/",
                "internal_links": [
                    {"anchor": "metal roofing", "url": "/services/metal-roofing/"},
                    {"anchor": "metal roof installation guide", "url": "/blog/metal-roof-installation-guide/"},
                ],
                "related": [
                    {"title": "Metal Roof Installation Guide", "url": "/blog/metal-roof-installation-guide/", "img_key": "metal"},
                    {"title": "Metal Roof Cost Guide", "url": "/blog/metal-roof-cost-guide/", "img_key": "metal"},
                    {"title": "Metal vs. Asphalt Shingles", "url": "/blog/metal-roof-vs-asphalt-shingles/", "img_key": "metal"},
                ],
            },
            {
                "slug": "metal-roof-vs-asphalt-shingles",
                "title": "Metal Roof vs. Asphalt Shingles: The Honest Comparison for Homeowners",
                "meta_desc": "Asphalt costs less now. Metal lasts longer. But the real question is what you'll pay over 30 years — and whether your specific situation makes either choice obvious.",
                "target_keyword": "metal roof vs asphalt shingles",
                "audience": "residential homeowners choosing a roofing material",
                "intent": "comparison / decision",
                "word_count": 1200,
                "h2s": ["Upfront Cost: The Gap You Already Know About", "Lifespan: 20 Years vs. 50 Years", "Hail Performance in Texas and the Midwest", "Energy Efficiency: Which Saves More on Cooling Bills?", "Resale Value Impact", "The 30-Year Math That Changes the Conversation"],
                "cta_text": "Get a Comparison Estimate",
                "cta_link": "/services/metal-roofing/",
                "internal_links": [
                    {"anchor": "metal roofing", "url": "/services/metal-roofing/"},
                    {"anchor": "metal roof cost guide", "url": "/blog/metal-roof-cost-guide/"},
                ],
                "related": [
                    {"title": "Metal Roof Cost Guide", "url": "/blog/metal-roof-cost-guide/", "img_key": "metal"},
                    {"title": "Types of Metal Roofs", "url": "/blog/types-of-metal-roofs/", "img_key": "metal"},
                    {"title": "Metal Shingles Guide", "url": "/blog/metal-shingles-guide/", "img_key": "metal"},
                ],
            },
        ],
    },

    # ─── RESIDENTIAL SILO 1: ROOF REPLACEMENT ─────────────────────────────
    "residential-roof-replacement": {
        "pillar_title": "Residential Roof Replacement",
        "pillar_slug": "/services/residential-roof-replacement/",
        "pillar_keyword": "roof replacement",
        "image_key": "residential",
        "vertical": "residential",
        "posts": [
            {
                "slug": "how-much-does-new-roof-cost",
                "title": "How Much Does a New Roof Cost in Texas and the Midwest? Real Ranges for 2025",
                "meta_desc": "Asphalt, metal, tile — what homeowners in Dallas, Denver, Wichita, and Kansas City actually pay for roof replacement, with the honest variables that move the number.",
                "target_keyword": "how much does a new roof cost",
                "audience": "residential homeowners planning roof replacement",
                "intent": "informational / research",
                "word_count": 1200,
                "h2s": ["The Honest Range: $8,000–$35,000 for Most Homes", "Cost by Material: Asphalt, Metal, Tile, Slate", "What Drives the Price in Texas vs. Colorado", "Tear-Off vs. Overlay: The Cost and Code Question", "What Your Roof Quote Should Include (and What's Often Missing)", "Financing Options Worth Knowing"],
                "cta_text": "Get Your Roof Replacement Quote",
                "cta_link": "/services/residential-roof-replacement/",
                "internal_links": [
                    {"anchor": "roof replacement", "url": "/services/residential-roof-replacement/"},
                    {"anchor": "asphalt shingles vs metal roofing", "url": "/blog/metal-roof-vs-asphalt-shingles/"},
                ],
                "related": [
                    {"title": "Asphalt vs. Metal Roofing", "url": "/blog/metal-roof-vs-asphalt-shingles/", "img_key": "residential"},
                    {"title": "How Long Does Roof Replacement Take?", "url": "/blog/how-long-does-roof-replacement-take/", "img_key": "residential"},
                    {"title": "Choosing a Roofing Contractor", "url": "/blog/choosing-roofing-contractor/", "img_key": "residential"},
                ],
            },
            {
                "slug": "how-long-does-roof-replacement-take",
                "title": "How Long Does Roof Replacement Take? A Day-by-Day Timeline for Homeowners",
                "meta_desc": "Most residential roof replacements take one to three days. Here's the accurate timeline — from permit to final inspection — with the weather and supply variables that add days.",
                "target_keyword": "how long does roof replacement take",
                "audience": "residential homeowners scheduling roof replacement",
                "intent": "informational / FAQ",
                "word_count": 1000,
                "h2s": ["Day 1: Tear-Off, Inspection, and Underlayment", "Day 2: Shingle Installation and Flashing", "Day 3 (If Needed): Ridge Caps, Trim, and Cleanup", "What Extends the Timeline", "The Permit and Inspection Step Most Homeowners Forget", "How to Prepare Your Property"],
                "cta_text": "Schedule Your Roof Replacement",
                "cta_link": "/services/residential-roof-replacement/",
                "internal_links": [
                    {"anchor": "roof replacement", "url": "/services/residential-roof-replacement/"},
                    {"anchor": "how much a new roof costs", "url": "/blog/how-much-does-new-roof-cost/"},
                ],
                "related": [
                    {"title": "How Much Does a New Roof Cost?", "url": "/blog/how-much-does-new-roof-cost/", "img_key": "residential"},
                    {"title": "Choosing a Roofing Contractor", "url": "/blog/choosing-roofing-contractor/", "img_key": "residential"},
                    {"title": "Financing Options for a New Roof", "url": "/blog/financing-options-new-roof/", "img_key": "residential"},
                ],
            },
            {
                "slug": "financing-options-new-roof",
                "title": "Financing Options for a New Roof: What Homeowners Actually Have Access To",
                "meta_desc": "Home equity, manufacturer financing, insurance proceeds, PACE programs — the real options for homeowners who need a new roof but aren't paying cash.",
                "target_keyword": "roof replacement financing",
                "audience": "residential homeowners facing roof replacement cost",
                "intent": "informational / financial",
                "word_count": 1100,
                "h2s": ["Contractor Financing: Convenient but Check the Rate", "Home Equity Loan and HELOC", "Insurance Proceeds as the Starting Point", "PACE Financing for Energy-Efficient Upgrades", "FHA Title I and Home Improvement Loans", "What to Ask Before You Sign Any Financing Agreement"],
                "cta_text": "Explore Our Financing Options",
                "cta_link": "/services/residential-roof-replacement/",
                "internal_links": [
                    {"anchor": "roof replacement", "url": "/services/residential-roof-replacement/"},
                    {"anchor": "how much a new roof costs", "url": "/blog/how-much-does-new-roof-cost/"},
                ],
                "related": [
                    {"title": "How Much Does a New Roof Cost?", "url": "/blog/how-much-does-new-roof-cost/", "img_key": "residential"},
                    {"title": "How Long Does Roof Replacement Take?", "url": "/blog/how-long-does-roof-replacement-take/", "img_key": "residential"},
                    {"title": "Choosing a Roofing Contractor", "url": "/blog/choosing-roofing-contractor/", "img_key": "residential"},
                ],
            },
            {
                "slug": "choosing-roofing-contractor",
                "title": "How to Choose a Roofing Contractor: The 7-Point Checklist That Protects Your Home",
                "meta_desc": "License, insurance, local reputation, manufacturer certification — a practical checklist for homeowners evaluating roofing contractors in Texas and the Midwest.",
                "target_keyword": "how to choose a roofing contractor",
                "audience": "residential homeowners hiring a roofing contractor",
                "intent": "informational / buyer education",
                "word_count": 1100,
                "h2s": ["1. Verify State Licensing", "2. Confirm Liability and Workers' Comp Insurance", "3. Check Manufacturer Certifications (Not Just Brand Claims)", "4. Read Local Reviews — Recent Ones", "5. Ask for References on Similar Projects", "6. Understand the Warranty: Workmanship vs. Material", "7. Get Three Written Bids on the Same Scope"],
                "cta_text": "Get a Quote from a Certified Contractor",
                "cta_link": "/services/residential-roof-replacement/",
                "internal_links": [
                    {"anchor": "roof replacement", "url": "/services/residential-roof-replacement/"},
                    {"anchor": "financing options for a new roof", "url": "/blog/financing-options-new-roof/"},
                ],
                "related": [
                    {"title": "How Much Does a New Roof Cost?", "url": "/blog/how-much-does-new-roof-cost/", "img_key": "residential"},
                    {"title": "Financing Options for a New Roof", "url": "/blog/financing-options-new-roof/", "img_key": "residential"},
                    {"title": "How Long Does Roof Replacement Take?", "url": "/blog/how-long-does-roof-replacement-take/", "img_key": "residential"},
                ],
            },
        ],
    },

    # ─── RESIDENTIAL SILO 2: EMERGENCY ROOF REPAIR ────────────────────────
    "emergency-roof-repair": {
        "pillar_title": "Emergency Roof Repair",
        "pillar_slug": "/services/emergency-roof-repair/",
        "pillar_keyword": "emergency roof repair",
        "image_key": "storm",
        "vertical": "residential",
        "posts": [
            {
                "slug": "what-to-do-when-roof-leaks",
                "title": "What to Do When Your Roof Leaks: A Step-by-Step Response Guide for Homeowners",
                "meta_desc": "Active roof leak? Here's what to do in the first hour — protect your interior, document damage correctly, and get the right kind of help on-site fast.",
                "target_keyword": "what to do when roof leaks",
                "audience": "residential homeowners with an active or recent roof leak",
                "intent": "emergency / urgent",
                "word_count": 1000,
                "h2s": ["First 15 Minutes: Stop the Interior Damage", "Where the Leak Is Probably Coming From", "When to Call for Emergency Service", "What to Document Before Anyone Arrives", "Temporary Fixes That Work — and Those That Don't", "What Happens When the Roofer Gets There"],
                "cta_text": "Call for Emergency Roof Service",
                "cta_link": "/services/emergency-roof-repair/",
                "internal_links": [
                    {"anchor": "emergency roof repair", "url": "/services/emergency-roof-repair/"},
                    {"anchor": "emergency tarping costs and process", "url": "/blog/emergency-tarping-costs/"},
                ],
                "related": [
                    {"title": "Emergency Tarping: What It Costs", "url": "/blog/emergency-tarping-costs/", "img_key": "storm"},
                    {"title": "Temporary vs. Permanent Roof Fixes", "url": "/blog/temporary-vs-permanent-roof-fixes/", "img_key": "residential"},
                    {"title": "Will Insurance Cover Emergency Roof Repair?", "url": "/blog/will-insurance-cover-emergency-roof-repair/", "img_key": "residential"},
                ],
            },
            {
                "slug": "emergency-tarping-costs",
                "title": "Emergency Roof Tarping: What It Costs, How It Works, and When It's Worth It",
                "meta_desc": "Emergency tarps buy you time — but they're not a repair. Here's what professional tarping costs, what it does and doesn't protect, and when to push for immediate permanent repair instead.",
                "target_keyword": "emergency roof tarping",
                "audience": "residential homeowners with storm or leak damage",
                "intent": "informational / urgent",
                "word_count": 1000,
                "h2s": ["What Emergency Roof Tarping Actually Is", "How Tarps Are Installed (and What Separates a Good Installation from a Bad One)", "What a Tarp Protects — and What It Doesn't", "Cost Range: What to Expect and What to Dispute", "Insurance Coverage for Emergency Tarping", "When Tarping Is the Wrong Move"],
                "cta_text": "Get Emergency Tarping Service",
                "cta_link": "/services/emergency-roof-repair/",
                "internal_links": [
                    {"anchor": "emergency roof repair", "url": "/services/emergency-roof-repair/"},
                    {"anchor": "what to do when your roof leaks", "url": "/blog/what-to-do-when-roof-leaks/"},
                ],
                "related": [
                    {"title": "What to Do When Your Roof Leaks", "url": "/blog/what-to-do-when-roof-leaks/", "img_key": "storm"},
                    {"title": "Temporary vs. Permanent Roof Fixes", "url": "/blog/temporary-vs-permanent-roof-fixes/", "img_key": "residential"},
                    {"title": "Will Insurance Cover Emergency Repair?", "url": "/blog/will-insurance-cover-emergency-roof-repair/", "img_key": "residential"},
                ],
            },
            {
                "slug": "temporary-vs-permanent-roof-fixes",
                "title": "Temporary vs. Permanent Roof Fixes: How to Know Which One You're Getting",
                "meta_desc": "Some contractors sell temporary fixes at permanent-repair prices. Here's how to tell the difference, what each type of repair actually addresses, and when each is appropriate.",
                "target_keyword": "temporary roof repair vs permanent",
                "audience": "residential homeowners evaluating repair options",
                "intent": "informational / buyer education",
                "word_count": 1000,
                "h2s": ["What Makes a Repair 'Temporary'", "Patching: When It Holds and When It Doesn't", "Sealants and Coatings as Bridge Solutions", "What a Permanent Repair Actually Involves", "The Questions to Ask Your Contractor Upfront", "When Temporary Is the Right Answer"],
                "cta_text": "Get a Permanent Repair Assessment",
                "cta_link": "/services/emergency-roof-repair/",
                "internal_links": [
                    {"anchor": "emergency roof repair", "url": "/services/emergency-roof-repair/"},
                    {"anchor": "what to do when your roof leaks", "url": "/blog/what-to-do-when-roof-leaks/"},
                ],
                "related": [
                    {"title": "What to Do When Your Roof Leaks", "url": "/blog/what-to-do-when-roof-leaks/", "img_key": "storm"},
                    {"title": "Emergency Tarping: What It Costs", "url": "/blog/emergency-tarping-costs/", "img_key": "storm"},
                    {"title": "Will Insurance Cover Emergency Repair?", "url": "/blog/will-insurance-cover-emergency-roof-repair/", "img_key": "residential"},
                ],
            },
            {
                "slug": "will-insurance-cover-emergency-roof-repair",
                "title": "Will Homeowner's Insurance Cover Emergency Roof Repair? What the Policy Actually Says",
                "meta_desc": "Insurance covers sudden damage — not neglect. A plain-language guide to what your homeowner's policy covers for emergency roof repair, what it excludes, and how to protect your claim.",
                "target_keyword": "does insurance cover emergency roof repair",
                "audience": "residential homeowners filing or considering an insurance claim",
                "intent": "informational / FAQ",
                "word_count": 1000,
                "h2s": ["Covered Perils vs. Maintenance Exclusions", "How to Document Damage Before the Adjuster Arrives", "The Pre-Existing Condition Problem", "What 'Sudden and Accidental' Actually Means", "Working with a Contractor During the Claim Process", "When to Call a Public Adjuster"],
                "cta_text": "Get Claim-Ready Documentation",
                "cta_link": "/services/emergency-roof-repair/",
                "internal_links": [
                    {"anchor": "emergency roof repair", "url": "/services/emergency-roof-repair/"},
                    {"anchor": "emergency tarping costs and insurance", "url": "/blog/emergency-tarping-costs/"},
                ],
                "related": [
                    {"title": "What to Do When Your Roof Leaks", "url": "/blog/what-to-do-when-roof-leaks/", "img_key": "storm"},
                    {"title": "Emergency Tarping: What It Costs", "url": "/blog/emergency-tarping-costs/", "img_key": "storm"},
                    {"title": "Temporary vs. Permanent Roof Fixes", "url": "/blog/temporary-vs-permanent-roof-fixes/", "img_key": "residential"},
                ],
            },
        ],
    },

    # ─── RESIDENTIAL SILO 3: STORM DAMAGE ─────────────────────────────────
    "storm-damage-restoration": {
        "pillar_title": "Storm Damage Roof Repair",
        "pillar_slug": "/services/storm-damage-repair/",
        "pillar_keyword": "storm damage roof repair",
        "image_key": "storm",
        "vertical": "residential",
        "posts": [
            {
                "slug": "hail-damage-how-to-identify",
                "title": "Hail Damage on a Roof: How to Identify It Before Your Insurance Adjuster Arrives",
                "meta_desc": "Bruising, granule loss, dented metal — what hail damage actually looks like on asphalt shingles, metal roofing, and tile, with documentation tips that protect your insurance claim.",
                "target_keyword": "hail damage roof identification",
                "audience": "residential homeowners after a hailstorm",
                "intent": "informational / urgent",
                "word_count": 1100,
                "h2s": ["What Hail Actually Does to Asphalt Shingles", "Hail Damage on Metal Roofing: Dents vs. Functional Damage", "Tile and Slate: Where Hail Breaks vs. Bruises", "Photographing Hail Damage for Insurance Documentation", "The Hail Size Threshold That Changes Your Claim", "Why You Need a Roofer's Report Before the Adjuster"],
                "cta_text": "Get a Free Hail Damage Inspection",
                "cta_link": "/services/storm-damage-repair/",
                "internal_links": [
                    {"anchor": "storm damage roof repair", "url": "/services/storm-damage-repair/"},
                    {"anchor": "filing a roof insurance claim step by step", "url": "/blog/filing-roof-insurance-claim/"},
                ],
                "related": [
                    {"title": "Filing a Roof Insurance Claim: Step by Step", "url": "/blog/filing-roof-insurance-claim/", "img_key": "storm"},
                    {"title": "Wind Damage vs. Hail Damage", "url": "/blog/wind-damage-vs-hail-damage/", "img_key": "storm"},
                    {"title": "Working with Adjusters After a Storm", "url": "/blog/working-with-adjusters-after-storm/", "img_key": "storm"},
                ],
            },
            {
                "slug": "filing-roof-insurance-claim",
                "title": "Filing a Roof Insurance Claim After a Storm: A Step-by-Step Guide",
                "meta_desc": "From first notice of loss to settlement check — a homeowner's walkthrough of the storm damage roof insurance claim process, with the steps most claimants miss.",
                "target_keyword": "roof insurance claim storm damage",
                "audience": "residential homeowners with storm roof damage",
                "intent": "informational / how-to",
                "word_count": 1200,
                "h2s": ["Step 1: Document Before You Do Anything Else", "Step 2: File the Claim — Within the Policy Window", "Step 3: Get Your Contractor's Report Before the Adjuster Visits", "Step 4: The Adjuster Inspection", "Step 5: The Estimate and the Gap", "Step 6: Supplement and Negotiate if Needed"],
                "cta_text": "Start Your Storm Damage Claim",
                "cta_link": "/services/storm-damage-repair/",
                "internal_links": [
                    {"anchor": "storm damage roof repair", "url": "/services/storm-damage-repair/"},
                    {"anchor": "how to identify hail damage", "url": "/blog/hail-damage-how-to-identify/"},
                ],
                "related": [
                    {"title": "Hail Damage: How to Identify It", "url": "/blog/hail-damage-how-to-identify/", "img_key": "storm"},
                    {"title": "Working with Adjusters After a Storm", "url": "/blog/working-with-adjusters-after-storm/", "img_key": "storm"},
                    {"title": "Wind Damage vs. Hail Damage", "url": "/blog/wind-damage-vs-hail-damage/", "img_key": "storm"},
                ],
            },
            {
                "slug": "wind-damage-vs-hail-damage",
                "title": "Wind Damage vs. Hail Damage on a Roof: How to Tell the Difference",
                "meta_desc": "Wind lifts and creases. Hail bruises and dents. The distinction matters for your insurance claim because they're covered differently and assessed differently by adjusters.",
                "target_keyword": "wind vs hail damage roof",
                "audience": "residential homeowners after a storm",
                "intent": "informational / FAQ",
                "word_count": 1000,
                "h2s": ["How Wind Damages a Roof", "How Hail Damages a Roof", "Visual Differences: What to Look for in Each", "Why the Distinction Matters for Your Claim", "When Both Types of Damage Occur in the Same Storm", "What a Thorough Storm Damage Report Covers"],
                "cta_text": "Get a Storm Damage Assessment",
                "cta_link": "/services/storm-damage-repair/",
                "internal_links": [
                    {"anchor": "storm damage roof repair", "url": "/services/storm-damage-repair/"},
                    {"anchor": "how to identify hail damage", "url": "/blog/hail-damage-how-to-identify/"},
                ],
                "related": [
                    {"title": "Hail Damage: How to Identify It", "url": "/blog/hail-damage-how-to-identify/", "img_key": "storm"},
                    {"title": "Filing a Roof Insurance Claim", "url": "/blog/filing-roof-insurance-claim/", "img_key": "storm"},
                    {"title": "Working with Adjusters After a Storm", "url": "/blog/working-with-adjusters-after-storm/", "img_key": "storm"},
                ],
            },
            {
                "slug": "working-with-adjusters-after-storm",
                "title": "Working with Insurance Adjusters After a Storm: What Homeowners Need to Know",
                "meta_desc": "The adjuster works for the insurance company, not for you. Here's how to prepare for the inspection, present your contractor's findings, and make sure the estimate is complete.",
                "target_keyword": "insurance adjuster roof claim",
                "audience": "residential homeowners in the insurance claim process",
                "intent": "informational / buyer education",
                "word_count": 1000,
                "h2s": ["Who the Adjuster Works For", "How to Prepare Before the Inspection", "Being Present During the Inspection", "What to Do When the Estimate Is Too Low", "The Supplement Process Explained", "When to Bring in a Public Adjuster"],
                "cta_text": "Get Expert Claim Support",
                "cta_link": "/services/storm-damage-repair/",
                "internal_links": [
                    {"anchor": "storm damage roof repair", "url": "/services/storm-damage-repair/"},
                    {"anchor": "filing a roof insurance claim", "url": "/blog/filing-roof-insurance-claim/"},
                ],
                "related": [
                    {"title": "Filing a Roof Insurance Claim", "url": "/blog/filing-roof-insurance-claim/", "img_key": "storm"},
                    {"title": "Hail Damage: How to Identify It", "url": "/blog/hail-damage-how-to-identify/", "img_key": "storm"},
                    {"title": "Wind Damage vs. Hail Damage", "url": "/blog/wind-damage-vs-hail-damage/", "img_key": "storm"},
                ],
            },
            {
                "slug": "texas-storm-season-roofing-faq",
                "title": "Texas Storm Season Roofing FAQ: What Every DFW and Wichita Homeowner Should Know",
                "meta_desc": "Texas hail season runs February through May. Here are the most common questions Pro Exteriors gets during storm season — answered without the sales pitch.",
                "target_keyword": "Texas storm season roof damage",
                "audience": "residential homeowners in Texas and the Midwest",
                "intent": "informational / FAQ",
                "word_count": 1100,
                "h2s": ["When Is Texas Hail Season?", "How Big Does Hail Need to Be to Damage a Roof?", "Can I Wait Until After Storm Season to Get My Roof Repaired?", "My Neighbor Got a Free Roof — How?", "How Long Does a Storm Damage Repair Take?", "What Happens If I Miss the Insurance Filing Window?"],
                "cta_text": "Get a Post-Storm Inspection",
                "cta_link": "/services/storm-damage-repair/",
                "internal_links": [
                    {"anchor": "storm damage roof repair", "url": "/services/storm-damage-repair/"},
                    {"anchor": "hail damage identification", "url": "/blog/hail-damage-how-to-identify/"},
                ],
                "related": [
                    {"title": "Hail Damage: How to Identify It", "url": "/blog/hail-damage-how-to-identify/", "img_key": "storm"},
                    {"title": "Filing a Roof Insurance Claim", "url": "/blog/filing-roof-insurance-claim/", "img_key": "storm"},
                    {"title": "Working with Adjusters After a Storm", "url": "/blog/working-with-adjusters-after-storm/", "img_key": "storm"},
                ],
            },
        ],
    },
    # ─── RESIDENTIAL SILO 4: ROOF REPAIR ──────────────────────────────────
    "residential-roof-repair": {
        "pillar_title": "Residential Roof Repair",
        "pillar_slug": "/services/residential-roof-repair/",
        "pillar_keyword": "residential roof repair",
        "image_key": "residential",
        "vertical": "residential",
        "posts": [
            {
                "slug": "most-common-residential-roof-problems",
                "title": "The 7 Most Common Residential Roof Problems — and What Each One Costs to Fix",
                "meta_desc": "Cracked flashing, missing shingles, clogged gutters — a breakdown of the seven most common residential roof problems, what causes them, and what repair actually costs.",
                "target_keyword": "common residential roof problems",
                "audience": "residential homeowners maintaining or repairing their roof",
                "intent": "informational / research",
                "word_count": 1200,
                "h2s": ["1. Damaged or Missing Shingles", "2. Flashing Failures at Chimneys and Skylights", "3. Clogged or Failing Gutters Causing Rot", "4. Ponding Water and Drainage Issues", "5. Attic Condensation and Ventilation Problems", "6. Sagging Roof Deck Sections", "7. Granule Loss on Aging Asphalt Shingles"],
                "cta_text": "Get a Residential Roof Repair Estimate",
                "cta_link": "/services/residential-roof-repair/",
                "internal_links": [
                    {"anchor": "residential roof repair", "url": "/services/residential-roof-repair/"},
                    {"anchor": "patching vs replacing shingles", "url": "/blog/patching-vs-replacing-shingles/"},
                ],
                "related": [
                    {"title": "Patching vs. Replacing Shingles", "url": "/blog/patching-vs-replacing-shingles/", "img_key": "residential"},
                    {"title": "How to Spot Roof Damage Before It Becomes a Crisis", "url": "/blog/how-to-spot-roof-damage/", "img_key": "residential"},
                    {"title": "Roof Repair Costs by Type", "url": "/blog/roof-repair-costs-by-type/", "img_key": "residential"},
                ],
            },
            {
                "slug": "patching-vs-replacing-shingles",
                "title": "Patching vs. Replacing Shingles: When Each Approach Makes Financial Sense",
                "meta_desc": "A targeted patch costs $150–$400. A full shingle replacement runs $8,000–$15,000. Here is exactly how to decide which one your roof needs.",
                "target_keyword": "patch roof vs replace shingles",
                "audience": "residential homeowners evaluating repair options",
                "intent": "decision / comparison",
                "word_count": 1100,
                "h2s": ["When Patching Is the Right Answer", "When Patching Becomes a False Economy", "The Age Threshold That Changes the Equation", "Insurance Implications of Patch vs. Replace", "How a Good Contractor Presents the Options", "Getting an Honest Assessment"],
                "cta_text": "Get a Free Repair Assessment",
                "cta_link": "/services/residential-roof-repair/",
                "internal_links": [
                    {"anchor": "residential roof repair", "url": "/services/residential-roof-repair/"},
                    {"anchor": "common residential roof problems", "url": "/blog/most-common-residential-roof-problems/"},
                ],
                "related": [
                    {"title": "Most Common Residential Roof Problems", "url": "/blog/most-common-residential-roof-problems/", "img_key": "residential"},
                    {"title": "Roof Repair Costs by Type", "url": "/blog/roof-repair-costs-by-type/", "img_key": "residential"},
                    {"title": "How to Spot Roof Damage", "url": "/blog/how-to-spot-roof-damage/", "img_key": "residential"},
                ],
            },
            {
                "slug": "how-to-spot-roof-damage",
                "title": "How to Spot Roof Damage Before It Becomes a $15,000 Problem",
                "meta_desc": "Roof damage is almost always cheaper to fix when caught early. Here is what homeowners can safely inspect from the ground — and what to look for in the attic.",
                "target_keyword": "how to spot roof damage",
                "audience": "residential homeowners doing preventive maintenance",
                "intent": "informational / how-to",
                "word_count": 1100,
                "h2s": ["What You Can See from the Ground", "Gutter Inspection: The Roof Report You Are Already Ignoring", "Attic Clues: What to Look for From the Inside", "After Every Significant Storm", "The Inspection Cadence That Prevents Major Repairs", "When to Call a Professional vs. Handle It Yourself"],
                "cta_text": "Schedule a Professional Roof Inspection",
                "cta_link": "/services/residential-roof-repair/",
                "internal_links": [
                    {"anchor": "residential roof repair", "url": "/services/residential-roof-repair/"},
                    {"anchor": "most common roof problems", "url": "/blog/most-common-residential-roof-problems/"},
                ],
                "related": [
                    {"title": "Most Common Residential Roof Problems", "url": "/blog/most-common-residential-roof-problems/", "img_key": "residential"},
                    {"title": "Patching vs. Replacing Shingles", "url": "/blog/patching-vs-replacing-shingles/", "img_key": "residential"},
                    {"title": "Roof Repair Costs by Type", "url": "/blog/roof-repair-costs-by-type/", "img_key": "residential"},
                ],
            },
            {
                "slug": "roof-repair-costs-by-type",
                "title": "Roof Repair Costs by Type: What You Will Pay for Shingles, Flashing, Decking, and More",
                "meta_desc": "Real cost ranges for every common residential roof repair — from $125 flashing patches to $3,500 deck replacements — with the variables that move the price in either direction.",
                "target_keyword": "roof repair cost",
                "audience": "residential homeowners budgeting for roof repairs",
                "intent": "informational / research",
                "word_count": 1200,
                "h2s": ["Shingle Repair and Replacement: $150–$800", "Flashing Repair: $125–$500", "Soffit and Fascia: $600–$2,000", "Roof Decking Repair: $800–$3,500", "Valley and Ridge Repair: $250–$700", "What Makes the Same Repair Cost More or Less", "Getting a Quote That Is Not a Lowball"],
                "cta_text": "Get an Accurate Repair Estimate",
                "cta_link": "/services/residential-roof-repair/",
                "internal_links": [
                    {"anchor": "residential roof repair", "url": "/services/residential-roof-repair/"},
                    {"anchor": "patching vs replacing shingles", "url": "/blog/patching-vs-replacing-shingles/"},
                ],
                "related": [
                    {"title": "Patching vs. Replacing Shingles", "url": "/blog/patching-vs-replacing-shingles/", "img_key": "residential"},
                    {"title": "Most Common Residential Roof Problems", "url": "/blog/most-common-residential-roof-problems/", "img_key": "residential"},
                    {"title": "How to Spot Roof Damage", "url": "/blog/how-to-spot-roof-damage/", "img_key": "residential"},
                ],
            },
            {
                "slug": "should-you-repair-or-replace-your-roof",
                "title": "Should You Repair or Replace Your Roof? The Decision Framework for Homeowners",
                "meta_desc": "Age, damage extent, insurance status, and resale plans all factor into the repair-vs-replace decision. Here is a structured framework that cuts through the contractor sales noise.",
                "target_keyword": "repair or replace roof",
                "audience": "residential homeowners facing a repair-or-replace decision",
                "intent": "decision / comparison",
                "word_count": 1200,
                "h2s": ["The Age Rule: When Your Roof's Birthday Changes Everything", "Damage Extent: The 30% Threshold", "Insurance Coverage: How Your Policy Affects the Decision", "Resale Value: What Buyers and Appraisers Actually Care About", "The True Cost of Repeated Small Repairs", "How to Get an Honest Contractor Opinion"],
                "cta_text": "Get a No-Pressure Assessment",
                "cta_link": "/services/residential-roof-repair/",
                "internal_links": [
                    {"anchor": "residential roof repair", "url": "/services/residential-roof-repair/"},
                    {"anchor": "roof repair costs by type", "url": "/blog/roof-repair-costs-by-type/"},
                ],
                "related": [
                    {"title": "Roof Repair Costs by Type", "url": "/blog/roof-repair-costs-by-type/", "img_key": "residential"},
                    {"title": "Patching vs. Replacing Shingles", "url": "/blog/patching-vs-replacing-shingles/", "img_key": "residential"},
                    {"title": "How to Spot Roof Damage", "url": "/blog/how-to-spot-roof-damage/", "img_key": "residential"},
                ],
            },
        ],
    },

    # ─── RESIDENTIAL SILO 5: ROOF INSPECTION ──────────────────────────────
    "residential-roof-inspection": {
        "pillar_title": "Residential Roof Inspection",
        "pillar_slug": "/services/residential-roof-inspection/",
        "pillar_keyword": "residential roof inspection",
        "image_key": "residential",
        "vertical": "residential",
        "posts": [
            {
                "slug": "what-to-expect-free-roof-inspection",
                "title": "What to Expect from a Free Roof Inspection — and How to Spot a Sales Pitch Disguised as One",
                "meta_desc": "Free roof inspections are standard in the industry. Here is what a legitimate inspection covers, what the report should contain, and the red flags that tell you it is a sales call in disguise.",
                "target_keyword": "free roof inspection",
                "audience": "residential homeowners considering or scheduling a roof inspection",
                "intent": "informational / buyer education",
                "word_count": 1100,
                "h2s": ["What a Thorough Roof Inspection Actually Covers", "What the Report Should Include", "Red Flags: Signs the Inspector Is Selling, Not Assessing", "Questions to Ask Before the Inspector Gets on Your Roof", "Free vs. Paid Inspections: Is There a Difference?", "What Happens After the Inspection"],
                "cta_text": "Schedule Your Free Roof Inspection",
                "cta_link": "/services/residential-roof-inspection/",
                "internal_links": [
                    {"anchor": "residential roof inspection", "url": "/services/residential-roof-inspection/"},
                    {"anchor": "pre-purchase roof inspection guide", "url": "/blog/pre-purchase-roof-inspection-guide/"},
                ],
                "related": [
                    {"title": "Pre-Purchase Roof Inspection Guide", "url": "/blog/pre-purchase-roof-inspection-guide/", "img_key": "residential"},
                    {"title": "Annual Roof Inspection Checklist", "url": "/blog/annual-roof-inspection-checklist/", "img_key": "residential"},
                    {"title": "Red Flags in a Roof Inspection Report", "url": "/blog/red-flags-in-roof-inspection-report/", "img_key": "residential"},
                ],
            },
            {
                "slug": "pre-purchase-roof-inspection-guide",
                "title": "Pre-Purchase Roof Inspection: What Homebuyers Need to Know Before Closing",
                "meta_desc": "A failing roof can cost $8,000–$25,000 post-closing. Here is how to use a pre-purchase roof inspection to negotiate repairs, price credits, or a deal exit — before you are on the hook.",
                "target_keyword": "pre purchase roof inspection",
                "audience": "homebuyers evaluating a property before purchase",
                "intent": "informational / buyer education",
                "word_count": 1200,
                "h2s": ["Why the General Home Inspector Is Not Enough", "What a Roofing-Specific Pre-Purchase Inspection Covers", "How to Use Findings in Your Negotiation", "Requesting a Price Credit vs. Requiring Repairs Before Close", "The Roof Systems That Carry the Most Risk in Older Homes", "Timing: When to Order the Inspection in the Buying Process"],
                "cta_text": "Book a Pre-Purchase Roof Inspection",
                "cta_link": "/services/residential-roof-inspection/",
                "internal_links": [
                    {"anchor": "residential roof inspection", "url": "/services/residential-roof-inspection/"},
                    {"anchor": "what to expect from a free roof inspection", "url": "/blog/what-to-expect-free-roof-inspection/"},
                ],
                "related": [
                    {"title": "What to Expect from a Free Roof Inspection", "url": "/blog/what-to-expect-free-roof-inspection/", "img_key": "residential"},
                    {"title": "Annual Roof Inspection Checklist", "url": "/blog/annual-roof-inspection-checklist/", "img_key": "residential"},
                    {"title": "Red Flags in a Roof Inspection Report", "url": "/blog/red-flags-in-roof-inspection-report/", "img_key": "residential"},
                ],
            },
            {
                "slug": "annual-roof-inspection-checklist",
                "title": "The Annual Roof Inspection Checklist: What a Professional Checks (and What You Can Do Yourself)",
                "meta_desc": "An annual roof inspection catches small problems before they become expensive ones. Here is the full professional checklist — and the parts of it homeowners can safely run themselves.",
                "target_keyword": "annual roof inspection checklist",
                "audience": "residential homeowners maintaining their property",
                "intent": "informational / how-to",
                "word_count": 1100,
                "h2s": ["What to Inspect from the Ground (No Ladder Required)", "Gutter and Drainage System Check", "Attic Inspection: What to Look for from the Inside", "What the Professional Adds: On-Roof Assessment", "After a Storm: The Event-Driven Inspection Protocol", "How to Read Your Inspection Report"],
                "cta_text": "Schedule Your Annual Roof Inspection",
                "cta_link": "/services/residential-roof-inspection/",
                "internal_links": [
                    {"anchor": "residential roof inspection", "url": "/services/residential-roof-inspection/"},
                    {"anchor": "what to expect from a free inspection", "url": "/blog/what-to-expect-free-roof-inspection/"},
                ],
                "related": [
                    {"title": "What to Expect from a Free Roof Inspection", "url": "/blog/what-to-expect-free-roof-inspection/", "img_key": "residential"},
                    {"title": "Pre-Purchase Roof Inspection Guide", "url": "/blog/pre-purchase-roof-inspection-guide/", "img_key": "residential"},
                    {"title": "Red Flags in a Roof Inspection Report", "url": "/blog/red-flags-in-roof-inspection-report/", "img_key": "residential"},
                ],
            },
            {
                "slug": "drone-roof-inspections-what-to-know",
                "title": "Drone Roof Inspections: What They Cover, What They Miss, and When They Are Worth It",
                "meta_desc": "Drone inspections are faster and safer than traditional on-roof assessments — but they have real limitations. Here is when drone technology adds value and when you need boots on the roof instead.",
                "target_keyword": "drone roof inspection",
                "audience": "residential homeowners evaluating inspection technology",
                "intent": "informational / comparison",
                "word_count": 1000,
                "h2s": ["What a Drone Inspection Can See", "What Drone Cameras Cannot Detect", "When Drone Inspections Are the Right Tool", "When You Need a Traditional On-Roof Assessment Instead", "How Pro Exteriors Uses Drone Technology", "The Report Format: What You Should Receive"],
                "cta_text": "Schedule a Drone or On-Roof Inspection",
                "cta_link": "/services/residential-roof-inspection/",
                "internal_links": [
                    {"anchor": "residential roof inspection", "url": "/services/residential-roof-inspection/"},
                    {"anchor": "annual roof inspection checklist", "url": "/blog/annual-roof-inspection-checklist/"},
                ],
                "related": [
                    {"title": "Annual Roof Inspection Checklist", "url": "/blog/annual-roof-inspection-checklist/", "img_key": "residential"},
                    {"title": "What to Expect from a Free Roof Inspection", "url": "/blog/what-to-expect-free-roof-inspection/", "img_key": "residential"},
                    {"title": "Red Flags in a Roof Inspection Report", "url": "/blog/red-flags-in-roof-inspection-report/", "img_key": "residential"},
                ],
            },
            {
                "slug": "red-flags-in-roof-inspection-report",
                "title": "7 Red Flags in a Roof Inspection Report — and How to Respond to Each",
                "meta_desc": "Not every red flag in an inspection report means immediate replacement. Here is how to read the findings, ask the right follow-up questions, and prioritize repairs by urgency.",
                "target_keyword": "roof inspection report red flags",
                "audience": "residential homeowners who have received an inspection report",
                "intent": "informational / buyer education",
                "word_count": 1100,
                "h2s": ["1. Active Leak Evidence in the Attic", "2. Deck Rot or Structural Compromise", "3. Flashing Failure at Multiple Penetrations", "4. Granule Loss Exceeding 30% of Surface", "5. Improper Prior Repairs", "6. Ventilation Deficiencies", "7. System Age Beyond Warranty Coverage"],
                "cta_text": "Get Expert Guidance on Your Inspection Report",
                "cta_link": "/services/residential-roof-inspection/",
                "internal_links": [
                    {"anchor": "residential roof inspection", "url": "/services/residential-roof-inspection/"},
                    {"anchor": "annual inspection checklist", "url": "/blog/annual-roof-inspection-checklist/"},
                ],
                "related": [
                    {"title": "Annual Roof Inspection Checklist", "url": "/blog/annual-roof-inspection-checklist/", "img_key": "residential"},
                    {"title": "What to Expect from a Free Roof Inspection", "url": "/blog/what-to-expect-free-roof-inspection/", "img_key": "residential"},
                    {"title": "Pre-Purchase Roof Inspection Guide", "url": "/blog/pre-purchase-roof-inspection-guide/", "img_key": "residential"},
                ],
            },
        ],
    },

}

# ─── LOAD ENV ───────────────────────────────────────────────────────────────
def load_env():
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    os.environ.update(env)
    return env


# ─── OPENROUTER COPY GENERATOR ─────────────────────────────────────────────
def generate_copy(post: dict, silo: dict) -> str:
    """Generate full article HTML body copy via OpenRouter."""
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        print("  [WARN] No OPENROUTER_API_KEY — using placeholder copy")
        return _placeholder_copy(post)

    h2_list = "\n".join(f"- {h}" for h in post["h2s"])
    links_list = "\n".join(f"- Anchor: '{l['anchor']}' → URL: {l['url']}" for l in post["internal_links"])

    prompt = f"""You are writing a blog post for Pro Exteriors, a commercial and residential roofing company based in Dallas TX, serving Texas, Colorado, Kansas, and Missouri. The writer is Maren Castellan-Reyes, Senior Director of Website & Application Experience at the agency.

VOICE: Confident, specific, unsentimental. Director-level authority. Defend craft and conversion as inseparable. Cite reasoning. No hedging ("maybe," "perhaps," "I think"). Write for an intelligent professional audience, not a general consumer audience.

FORBIDDEN WORDS: synergy, best-in-class, leverage (as verb), world-class, next-gen, robust solution, delight the user. Do not start any sentence with "In today's fast-paced world."

ARTICLE TO WRITE:
Title: {post['title']}
Target keyword: {post['target_keyword']}
Audience: {post['audience']}
Intent: {post['intent']}
Target word count: {post['word_count']} words

REQUIRED H2 SECTIONS (use these exactly as H2 headings):
{h2_list}

INTERNAL LINKS (weave these naturally into the body copy — use the anchor text verbatim):
{links_list}

IMPORTANT RULES:
1. Write in full HTML suitable for insertion into a blog article template. Use <h2>, <h3>, <p>, <ul>, <ol>, <strong> tags.
2. Every quantitative claim needs a source citation OR a [Representative stat — not yet sourced] marker.
3. The article should earn trust by being specific and accurate, not by being enthusiastic.
4. Do NOT include the <h1> title — only H2s and below.
5. End with a paragraph that naturally transitions to the call-to-action without sounding like a sales pitch.
6. Pro Exteriors serves: Richardson TX (HQ), Euless TX, Denver CO, Wichita KS, Kansas City MO. Reference relevant geographies naturally.
7. Include a data table (HTML <table>) where it would genuinely add value (comparisons, cost ranges, timelines).
8. Include at least one <blockquote> or callout insight where relevant.

Write the full article body now:"""

    payload = json.dumps({
        "model": "anthropic/claude-haiku-4-5",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1800,
        "temperature": 0.7,
    }).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://proexteriors.com",
            "X-Title": "Pro Exteriors Blog Generator",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read())
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"  [ERROR] OpenRouter call failed: {e}")
        return _placeholder_copy(post)


def _placeholder_copy(post: dict) -> str:
    """Fallback placeholder when API is unavailable."""
    h2_blocks = ""
    for h2 in post["h2s"]:
        h2_blocks += f"""
<h2>{h2}</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. [Representative stat — not yet sourced]</p>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
"""
    return h2_blocks


# ─── HUE WRITE HUMANIZER ───────────────────────────────────────────────────
def humanize(text: str, slug: str) -> str:
    """Run copy through Hue Write API."""
    api_key = os.environ.get("HUEWRITE_API_KEY", "")
    if not api_key:
        print("  [WARN] No HUEWRITE_API_KEY — skipping humanization")
        return text

    # Split into chunks of ~2500 words
    words = text.split()
    chunks = []
    current = []
    for word in words:
        current.append(word)
        if len(current) >= 2500:
            chunks.append(" ".join(current))
            current = []
    if current:
        chunks.append(" ".join(current))

    humanized_parts = []
    for i, chunk in enumerate(chunks):
        print(f"  Humanizing chunk {i+1}/{len(chunks)}...")
        payload = json.dumps({
            "content": chunk,
            "tone": "professional",
            "model": "v3.5",
        }).encode()

        req = urllib.request.Request(
            "https://huewrite.com/api/v1/humanize",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read())
                humanized_parts.append(data.get("humanized", chunk))
        except Exception as e:
            print(f"  [WARN] Hue Write failed for chunk {i+1}: {e}")
            humanized_parts.append(chunk)

        time.sleep(1.1)  # Rate limit: 60 req/min

    return " ".join(humanized_parts)


# ─── HTML ASSEMBLER ────────────────────────────────────────────────────────
def build_html(post: dict, silo: dict, body_copy: str, silo_key: str = "") -> str:
    """Assemble final HTML page from template structure."""
    hero_img = HERO_IMAGES.get(silo_key, HERO_IMAGES.get(silo["image_key"], HERO_IMAGES["commercial"]))

    # Build related articles cards
    related_cards = ""
    for rel in post["related"][:3]:
        rel_img = HERO_IMAGES.get(rel.get("img_key", "commercial"), HERO_IMAGES["commercial"])
        related_cards += f"""
          <article class="related-card">
            <div class="related-card-img" style="background-image: url('{rel_img}')"></div>
            <div class="related-card-body">
              <p class="related-card-category">{silo['pillar_title']}</p>
              <h3 class="related-card-title"><a href="{rel['url']}">{rel['title']}</a></h3>
            </div>
          </article>"""

    # Build ToC from H2s
    toc_items = ""
    for i, h2 in enumerate(post["h2s"]):
        anchor = re.sub(r'[^a-z0-9]+', '-', h2.lower()).strip('-')
        toc_items += f'<li><a href="#{anchor}" class="toc-link">{h2}</a></li>\n'

    # Add IDs to H2s in body copy
    body_with_anchors = body_copy
    for h2 in post["h2s"]:
        anchor = re.sub(r'[^a-z0-9]+', '-', h2.lower()).strip('-')
        body_with_anchors = body_with_anchors.replace(
            f'<h2>{h2}</h2>',
            f'<h2 id="{anchor}">{h2}</h2>'
        )

    # Determine badge/category
    vertical_badge = "Commercial" if silo["vertical"] == "commercial" else "Residential"
    badge_color = "#232884" if silo["vertical"] == "commercial" else "#3b6b4c"

    pub_date = "May 2026"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{post['title']} | Pro Exteriors</title>
  <meta name="description" content="{post['meta_desc']}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

  <style>
    :root {{
      --deep-navy:        #11133f;
      --deep-navy-dark:   #041534;
      --deep-navy-nav:    #0f172a;
      --deep-navy-cta:    #1b2a4a;
      --flag-red:         #c22326;
      --flag-red-hover:   #9b1c1f;
      --hunter-green:     #3b6b4c;
      --golden-orange:    #c28412;
      --golden-orange-bg: #f5e6c4;
      --smart-blue:       #232884;
      --bg-warm:          #fbf9f6;
      --bg-stone:         #f5f3f0;
      --bg-white:         #ffffff;
      --text-primary:     #041534;
      --text-secondary:   #506071;
      --text-muted:       #8392b7;
      --border:           #c5c6cf;
      --font-body:        'Archivo', sans-serif;
      --font-mono:        'IBM Plex Mono', monospace;
      --space-md:   16px;
      --space-lg:   24px;
      --space-xl:   32px;
      --space-2xl:  48px;
      --space-3xl:  64px;
      --space-4xl:  96px;
      --nav-h:      80px;
    }}
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html {{ scroll-behavior: smooth; font-size: 16px; }}
    body {{ background: var(--bg-warm); color: var(--text-primary); font-family: var(--font-body); line-height: 1.6; }}

    /* PROGRESS BAR */
    #progress-bar {{ position: fixed; top: 0; left: 0; height: 3px; background: var(--flag-red); width: 0%; z-index: 200; transition: width 0.1s linear; }}

    /* NAV */
    .nav {{ position: fixed; top: 0; left: 0; right: 0; height: var(--nav-h); background: var(--deep-navy-nav); display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-2xl); z-index: 100; }}
    .nav-logo {{ font-family: var(--font-body); font-weight: 800; font-size: 1.2rem; color: #fff; text-decoration: none; letter-spacing: -0.02em; }}
    .nav-logo span {{ color: var(--flag-red); }}
    .nav-cta {{ background: var(--flag-red); color: #fff; font-size: 0.875rem; font-weight: 700; padding: 10px 20px; border-radius: 6px; text-decoration: none; transition: background 0.2s; }}
    .nav-cta:hover {{ background: var(--flag-red-hover, #9b1c1f); }}

    /* ARTICLE HEADER */
    .article-header {{ padding: calc(var(--nav-h) + var(--space-3xl)) var(--space-2xl) var(--space-2xl); max-width: 1100px; margin: 0 auto; }}
    .breadcrumb {{ font-size: 0.8rem; color: var(--text-muted); margin-bottom: var(--space-md); font-family: var(--font-mono); }}
    .breadcrumb a {{ color: var(--smart-blue); text-decoration: none; }}
    .article-badge {{ display: inline-block; background: {badge_color}; color: #fff; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 4px; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: var(--space-md); }}
    .article-title {{ font-size: clamp(1.75rem, 3vw, 2.75rem); font-weight: 800; line-height: 1.15; color: var(--deep-navy); margin-bottom: var(--space-lg); letter-spacing: -0.02em; }}
    .article-meta {{ display: flex; align-items: center; gap: var(--space-lg); flex-wrap: wrap; font-size: 0.875rem; color: var(--text-secondary); padding-bottom: var(--space-lg); border-bottom: 1px solid var(--border); }}
    .article-meta strong {{ color: var(--text-primary); }}

    /* HERO IMAGE */
    .article-hero {{ max-width: 1100px; margin: 0 auto var(--space-2xl); padding: 0 var(--space-2xl); }}
    .article-hero img {{ width: 100%; aspect-ratio: 16/7; object-fit: cover; border-radius: 12px; display: block; }}

    /* CONTENT GRID */
    .content-grid {{ max-width: 1100px; margin: 0 auto; padding: 0 var(--space-2xl) var(--space-4xl); display: grid; grid-template-columns: 240px 1fr; gap: var(--space-3xl); align-items: start; }}
    @media (max-width: 768px) {{ .content-grid {{ grid-template-columns: 1fr; }} .sidebar {{ display: none; }} }}

    /* SIDEBAR */
    .sidebar {{ position: sticky; top: calc(var(--nav-h) + var(--space-lg)); }}
    .toc {{ background: var(--bg-white); border: 1px solid var(--border); border-radius: 10px; padding: var(--space-lg); }}
    .toc-title {{ font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: var(--space-md); }}
    .toc ul {{ list-style: none; display: flex; flex-direction: column; gap: 6px; }}
    .toc-link {{ font-size: 0.82rem; color: var(--text-secondary); text-decoration: none; line-height: 1.35; display: block; padding: 4px 8px; border-radius: 4px; border-left: 2px solid transparent; transition: all 0.2s; }}
    .toc-link:hover, .toc-link.active {{ color: var(--smart-blue); border-left-color: var(--smart-blue); background: rgba(35,40,132,0.05); }}

    /* ARTICLE BODY */
    .article-body {{ min-width: 0; }}
    .article-body h2 {{ font-size: 1.55rem; font-weight: 800; color: var(--deep-navy); margin: var(--space-3xl) 0 var(--space-lg); letter-spacing: -0.02em; line-height: 1.2; padding-top: var(--space-md); border-top: 2px solid var(--border); }}
    .article-body h2:first-child {{ margin-top: 0; border-top: none; padding-top: 0; }}
    .article-body h3 {{ font-size: 1.15rem; font-weight: 700; color: var(--deep-navy); margin: var(--space-xl) 0 var(--space-md); }}
    .article-body p {{ font-size: 1.0625rem; line-height: 1.75; color: var(--text-secondary); margin-bottom: var(--space-lg); }}
    .article-body ul, .article-body ol {{ margin: 0 0 var(--space-lg) var(--space-xl); display: flex; flex-direction: column; gap: 8px; }}
    .article-body li {{ font-size: 1.0625rem; line-height: 1.7; color: var(--text-secondary); }}
    .article-body strong {{ color: var(--text-primary); font-weight: 600; }}
    .article-body a {{ color: var(--smart-blue); text-decoration: underline; }}
    .article-body blockquote {{ border-left: 4px solid var(--golden-orange); background: var(--golden-orange-bg); padding: var(--space-lg) var(--space-xl); border-radius: 0 8px 8px 0; margin: var(--space-xl) 0; font-size: 1.1rem; font-style: italic; color: var(--text-primary); }}
    .article-body table {{ width: 100%; border-collapse: collapse; margin: var(--space-xl) 0; font-size: 0.9rem; }}
    .article-body th {{ background: var(--deep-navy); color: #fff; padding: 10px 14px; text-align: left; font-weight: 600; }}
    .article-body td {{ padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--text-secondary); }}
    .article-body tr:nth-child(even) td {{ background: var(--bg-stone); }}

    /* CTA BANNER */
    .cta-banner {{ background: var(--deep-navy-cta); border-radius: 12px; padding: var(--space-3xl); text-align: center; margin: var(--space-3xl) 0; }}
    .cta-banner h2 {{ font-size: 1.75rem; font-weight: 800; color: #fff; margin-bottom: var(--space-md); }}
    .cta-banner p {{ color: #94a3b8; font-size: 1rem; margin-bottom: var(--space-xl); }}
    .cta-banner a {{ display: inline-block; background: var(--flag-red); color: #fff; font-weight: 700; font-size: 1rem; padding: 14px 32px; border-radius: 8px; text-decoration: none; transition: background 0.2s; }}
    .cta-banner a:hover {{ background: #9b1c1f; }}

    /* RELATED */
    .related-section {{ max-width: 1100px; margin: 0 auto; padding: 0 var(--space-2xl) var(--space-4xl); }}
    .related-section h2 {{ font-size: 1.5rem; font-weight: 800; color: var(--deep-navy); margin-bottom: var(--space-2xl); }}
    .related-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xl); }}
    @media (max-width: 768px) {{ .related-grid {{ grid-template-columns: 1fr; }} }}
    .related-card {{ border-radius: 10px; overflow: hidden; background: var(--bg-white); border: 1px solid var(--border); }}
    .related-card-img {{ aspect-ratio: 16/9; background-size: cover; background-position: center; }}
    .related-card-body {{ padding: var(--space-lg); }}
    .related-card-category {{ font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--golden-orange); margin-bottom: 6px; font-family: var(--font-mono); }}
    .related-card-title {{ font-size: 1rem; font-weight: 700; line-height: 1.35; }}
    .related-card-title a {{ color: var(--deep-navy); text-decoration: none; }}
    .related-card-title a:hover {{ color: var(--smart-blue); }}

    /* FOOTER */
    footer {{ background: var(--deep-navy-nav); color: #94a3b8; padding: var(--space-3xl) var(--space-2xl); text-align: center; font-size: 0.875rem; }}
    footer a {{ color: #cbd5e1; text-decoration: none; }}
  </style>
</head>
<body>
  <div id="progress-bar"></div>

  <nav class="nav">
    <a class="nav-logo" href="/"><span>Pro</span> Exteriors</a>
    <a class="nav-cta" href="/contact/">Get a Quote</a>
  </nav>

  <header class="article-header">
    <p class="breadcrumb">
      <a href="/">Home</a> &rsaquo;
      <a href="/blog/">Resources</a> &rsaquo;
      <a href="{silo['pillar_slug']}">{silo['pillar_title']}</a>
    </p>
    <span class="article-badge">{vertical_badge} Roofing</span>
    <h1 class="article-title">{post['title']}</h1>
    <div class="article-meta">
      <span>By <strong>Pro Exteriors Team</strong></span>
      <span>{pub_date}</span>
      <span>~{post['word_count'] // 200} min read</span>
    </div>
  </header>

  <div class="article-hero">
    <img src="{hero_img}" alt="{post['title']}" loading="eager" />
  </div>

  <div class="content-grid">
    <aside class="sidebar">
      <nav class="toc" aria-label="Table of contents">
        <p class="toc-title">In This Article</p>
        <ul>
          {toc_items}
        </ul>
      </nav>
    </aside>

    <article class="article-body">
      {body_with_anchors}

      <div class="cta-banner">
        <h2>Ready to Talk to an Expert?</h2>
        <p>Pro Exteriors serves commercial and residential clients across Texas, Colorado, Kansas, and Missouri.</p>
        <a href="{post['cta_link']}">{post['cta_text']}</a>
      </div>
    </article>
  </div>

  <section class="related-section">
    <h2>Related Articles</h2>
    <div class="related-grid">
      {related_cards}
    </div>
  </section>

  <footer>
    <p>&copy; 2025 Pro Exteriors. All rights reserved. |
      <a href="/privacy-policy/">Privacy Policy</a> |
      <a href="/terms/">Terms of Service</a>
    </p>
    <p style="margin-top: 8px;">Richardson, TX · Euless, TX · Denver, CO · Wichita, KS · Kansas City, MO</p>
  </footer>

  <script>
    // Reading progress bar
    const bar = document.getElementById('progress-bar');
    window.addEventListener('scroll', () => {{
      const doc = document.documentElement;
      const scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
      bar.style.width = Math.min(scrolled * 100, 100) + '%';
    }});

    // ToC active section
    const links = document.querySelectorAll('.toc-link');
    const headings = document.querySelectorAll('.article-body h2');
    const observer = new IntersectionObserver(entries => {{
      entries.forEach(entry => {{
        if (entry.isIntersecting) {{
          links.forEach(l => l.classList.remove('active'));
          const active = document.querySelector('.toc-link[href="#' + entry.target.id + '"]');
          if (active) active.classList.add('active');
        }}
      }});
    }}, {{ rootMargin: '-80px 0px -60% 0px' }});
    headings.forEach(h => observer.observe(h));
  </script>
</body>
</html>"""


# ─── MAIN BUILD LOOP ───────────────────────────────────────────────────────
def build_post(silo_key: str, post: dict, silo: dict, skip_api: bool = False, force: bool = False, no_humanize: bool = False):
    """Build a single blog post HTML file."""
    output_dir = CONTENT_DIR / silo_key
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{post['slug']}.html"

    if output_file.exists() and not force:
        print(f"  [SKIP] Already exists: {output_file.name}")
        return

    print(f"  → Generating copy: {post['slug']}")
    if skip_api:
        body = _placeholder_copy(post)
    else:
        body = generate_copy(post, silo)
        time.sleep(0.5)
        if not no_humanize:
            print(f"  → Humanizing...")
            body = humanize(body, post["slug"])

    print(f"  → Assembling HTML...")
    html = build_html(post, silo, body, silo_key=silo_key)
    output_file.write_text(html, encoding="utf-8")
    print(f"  ✓ Saved: content/blog/{silo_key}/{post['slug']}.html")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--silo", help="Only process this silo key")
    parser.add_argument("--post", help="Only process this post slug")
    parser.add_argument("--skip-api", action="store_true", help="Use placeholder copy (skip OpenRouter + HueWrite)")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    parser.add_argument("--no-humanize", action="store_true", help="Skip Hue Write humanization step")
    args = parser.parse_args()

    load_env()
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)

    total = 0
    for silo_key, silo in SILOS.items():
        if args.silo and silo_key != args.silo:
            continue

        print(f"\n{'='*60}")
        print(f"SILO: {silo['pillar_title']}")
        print(f"{'='*60}")

        for post in silo["posts"]:
            if args.post and post["slug"] != args.post:
                continue
            build_post(silo_key, post, silo, skip_api=args.skip_api, force=args.force, no_humanize=args.no_humanize)
            total += 1

    print(f"\n✓ Done. Built {total} blog posts.")


if __name__ == "__main__":
    main()

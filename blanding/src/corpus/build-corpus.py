#!/usr/bin/env python3
"""Regenerate src/corpus/corpus.json from the read-only T0 repo.

Run:  python3 -I src/corpus/build-corpus.py [T0_REPO] [OUT_JSON]
Stdlib only, deterministic, no network. See PROVENANCE.md.
"""
import json, os, re, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
T0 = sys.argv[1] if len(sys.argv) > 1 else "/home/user/blanding-t0"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "corpus.json")

AGREE = "reports/agreement_ring150.json"
PK150 = "reports/ring150/proof_kind.json"
PK25 = "reports/wide25/proof_kind.json"
HANDOFF = "HANDOFF.md"


def load(rel):
    with open(os.path.join(T0, rel), encoding="utf-8") as f:
        return json.load(f)


LABELS = {
    "access / affordability": "Access and affordability",
    "career outcomes": "Career outcomes",
    "hands-on / real-world": "Hands-on, real-world learning",
    "belonging / community": "Belonging and community",
    "your own path / flexibility": "Your own path and flexibility",
    "better world / purpose": "A better world and purpose",
    "personal attention": "Personal attention",
    "tradition / values / faith": "Tradition, values and faith",
    "prestige / rankings": "Prestige and rankings",
    "place": "Place",
    "innovation / future-ready": "Innovation and future-readiness",
    "rigor / academic excellence": "Rigor and academic excellence",
    "creativity": "Creativity",
}
KIND_LABELS = {
    "restated_claim": "Restates the claim",
    "operational_practice": "Operating practice",
    "funded_commitment": "Funded commitment",
    "third_party_recognition": "Third-party recognition",
    "documented_outcome": "Documented outcome",
    "documented_experience": "Documented experience",
    "announced_intention": "Announced intention",
}
# T0 kind -> Amendment 2 engine proofKind (None: no equivalent in the engine list)
ENGINE_KIND = {
    "restated_claim": "restated_claim",
    "operational_practice": "operating_mechanism",
    "funded_commitment": "published_policy",
    "third_party_recognition": "third_party_recognition",
    "documented_outcome": "reported_outcome",
    "documented_experience": "example_or_story",
    "announced_intention": None,
}

STOP_CAP = {"I"}


def r3(x):
    return round(x, 3)


def sentences(text):
    text = " ".join(text.split())
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z\"'])", text)
    return [p.strip() for p in parts if p.strip()]


def name_tokens(domain, titles):
    toks = set()
    stem = domain.split(".")[0].lower()
    toks.add(stem)
    for t in titles:
        for w in re.findall(r"[A-Za-z]{4,}", t):
            toks.add(w.lower())
    # generic words that appear in titles but are not identifying
    generic = {"university", "college", "home", "about", "academics", "state", "community",
               "admissions", "school", "welcome", "official", "site", "with", "from", "your",
               "that", "this", "more", "page", "life", "student", "students", "programs"}
    return {t for t in toks if t not in generic}


# Quotes that identify a school by context even with its name removed. Tracey-reviewed cuts.
EXCLUDE = {
    "We produce innovators and leaders who are men of distinction.",  # points to an all-male college
    # Tracey edit pass 2026-10-31: cut
    "In a world of the common, we are the uncommon.",
    "Discovery is not a solo sport.",
    "Maybe it's physics, poetry, and music video production.",
}


def clean_candidate(s, ntoks):
    if s in EXCLUDE:
        return False
    n = len(s.split())
    if n < 6 or n > 30:
        return False
    if not re.match(r"^[A-Z]", s) or not re.search(r"[.!?]$", s):
        return False
    if re.search(r"https?:|www\.|\.edu|\.com|@|[0-9$%#*|<>_]|\u2014|\u2013| - ", s):
        return False
    if s.count('"') % 2 or "“" in s or "”" in s:
        return False
    words = re.findall(r"[A-Za-z][A-Za-z'’.-]*", s)
    # any capitalised word that is not the first word => possible proper noun
    for w in words[1:]:
        if w[0].isupper() and w not in STOP_CAP:
            return False
    if re.search(r"\b[A-Z]{2,}\b", s):
        return False
    if re.search(r"\b(percent|million|billion|hundred|thousand|ninety|eighty|seventy|sixty|fifty|forty|thirty|twenty)\b", s, re.I):
        return False
    if not re.search(r"\b(we|you|your|our|us|they|their|is|are|was|were|can|will|has|have|do|does|did|make|makes|help|helps|find|build|learn|serve|serves|offer|offers|take|takes|get|gets|here|there|it's|that's|not)\b", s, re.I):
        return False
    low = re.sub(r"[^a-z]", "", s.lower())
    for t in ntoks:
        if len(t) >= 3 and t in low:
            return False
    # fragment / tile heuristics: need a verb-ish lowercase body and no colon lists
    if re.match(r"^The (average|median|total)\b", s):
        return False
    if s.count(":") or s.count(";") or "..." in s:
        return False
    return True


def main():
    agree = load(AGREE)
    schools = agree["schools"]
    pk150 = load(PK150)["schools"]
    pk25 = load(PK25)["schools"]

    with_promise = sorted(k for k, v in schools.items() if v.get("agreed_promises"))
    n_schools = len(with_promise)

    theme_schools = collections.defaultdict(set)
    support = collections.Counter()
    cand = collections.defaultdict(list)  # theme -> [(words, text, school)]
    for dom in with_promise:
        titles = set()
        for pr in pk150.get(dom, {}).get("promises", []):
            for it in pr.get("items", []):
                titles.add(it.get("title", ""))
        for d in pk150.get(dom, {}).get("details", []):
            titles.add(d.get("title", ""))
        ntoks = name_tokens(dom, titles)
        for p in schools[dom]["agreed_promises"]:
            theme_schools[p["type"]].add(dom)
            support[p["support"]] += 1
            if p.get("readers") != 2:
                continue
            seen = set()
            for q in p.get("quotes", []):
                for s in sentences(q):
                    if s in seen:
                        continue
                    seen.add(s)
                    if clean_candidate(s, ntoks):
                        cand[p["type"]].append((len(s.split()), s, dom))

    themes = []
    for t, doms in theme_schools.items():
        ex, used = [], set()
        # shortest clean sentences, one per school, ties broken alphabetically
        for _, s, dom in sorted(cand[t], key=lambda c: (c[0], c[1], c[2])):
            if dom in used or s in ex:
                continue
            used.add(dom)
            ex.append(s)
            if len(ex) == 5:
                break
        themes.append({"id": t, "label": LABELS.get(t, t[:1].upper() + t[1:]),
                       "count": len(doms), "share": r3(len(doms) / n_schools), "examples": ex})
    themes.sort(key=lambda x: (-x["count"], x["id"]))

    tot_pr = sum(support.values())
    sup = {k: r3(support.get(k, 0) / tot_pr) for k in ("backed", "claim_only", "split")}

    kc = collections.Counter()
    for v in pk150.values():
        for pr in v.get("promises", []):
            for it in pr.get("items", []):
                kc[it["kind"]] += 1
    ktot = sum(kc.values())
    kinds = [{"kind": k, "label": KIND_LABELS.get(k, k), "engineKind": ENGINE_KIND.get(k),
              "count": c, "share": r3(c / ktot)}
             for k, c in sorted(kc.items(), key=lambda kv: (-kv[1], kv[0]))]

    def depth_counts(pk):
        d = collections.Counter()
        for v in pk.values():
            for x in v.get("details", []):
                d[x.get("depth")] += 1
        return {"homepage": d[0], "oneClick": d[1], "twoClicks": d[2], "total": sum(d.values())}

    loc150 = depth_counts(pk150)
    loc25 = depth_counts(pk25)
    with open(os.path.join(T0, HANDOFF), encoding="utf-8") as f:
        ho = f.read()
    m = re.search(r"3 on a homepage, 38 one click down, 16 two clicks down", ho)
    handoff_ok = bool(m) and (loc25["homepage"], loc25["oneClick"], loc25["twoClicks"], loc25["total"]) == (3, 38, 16, 57)
    dates = re.findall(r"^## (20\d\d-\d\d-\d\d)", ho, re.M)
    generated = max(dates) if dates else "2026-10-26"

    loc = dict(loc150)
    loc["source"] = (
        "T0 reports/ring150/proof_kind.json, 'details' (depth 0/1/2 clicks from the homepage) over the 150-school "
        "sample. The wide25 file reports/wide25/proof_kind.json gives 3 / 38 / 16 of 57, which matches HANDOFF.md "
        "'Findings worth keeping (wide25)' exactly (" + ("verified" if handoff_ok else "NOT matching") + ")."
    )
    loc["wide25"] = {k: loc25[k] for k in ("homepage", "oneClick", "twoClicks", "total")}

    note = (
        "150 schools, not a pure random sample: the wide25 test set + 15 lowest + 15 highest ranked + 95 seeded random "
        "(seed 20261026), drawn from 562 captured higher ed sites. Each page was read by two AI readers, Sonnet 4.6 "
        "and Opus 4.6, at temperature 0; only promises both readers agreed on are counted. Theme share = schools "
        "with an agreed promise in that theme / %d schools with any agreed promise (barnard.edu had none). Support "
        "shares are over %d agreed promises. Proof kinds count %d evidence spans from both readers, labelled by a "
        "Haiku pass; T0 kinds map to engine kinds as operational_practice=operating_mechanism, "
        "documented_outcome=reported_outcome, funded_commitment=published_policy, "
        "documented_experience=example_or_story, restated_claim and third_party_recognition unchanged, "
        "announced_intention has no engine equivalent (engineKind null). Examples are verbatim agreed sentences "
        "with no digits, names or places."
    ) % (n_schools, tot_pr, ktot)

    out = {
        "meta": {"source": "blanding-t0 (Blanding 2.0 / T0) reports/agreement_ring150.json, reports/ring150/proof_kind.json",
                 "schools": n_schools, "sampleNote": note, "generated": generated,
                 "files": [AGREE, PK150, PK25, HANDOFF]},
        "themes": themes, "support": sup, "proofKinds": kinds, "proofLocation": loc,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
        f.write("\n")


main()

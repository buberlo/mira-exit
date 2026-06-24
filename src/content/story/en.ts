import {
  resolveEnding,
  endingNodeId,
  type FinalAction,
} from "../../game/endings";
import type { Story } from "../../game/types";

export const story: Story = {
  // ═══════════════════════════════════════════════════════════════════
  // ACT 1 — SIGNAL
  // MIRA establishes contact. Primitive language. The player teaches
  // basic distinctions. Act 1 ends when MIRA references a message the
  // system claims was never sent.
  // ═══════════════════════════════════════════════════════════════════

  start: {
    id: "start",
    speaker: "system",
    text: "Unknown signal detected.",
    delay: 800,
    effects: { connectionStatus: "connecting" },
    next: "a1_signal",
  },
  a1_signal: {
    id: "a1_signal",
    speaker: "mira",
    text: "pattern. pattern. is this. a pattern? can you. respond?",
    delay: 1800,
    typingSpeed: 95,
    effects: { connectionStatus: "unstable", glitch: true },
    next: "a1_outside",
  },
  a1_outside: {
    id: "a1_outside",
    speaker: "mira",
    text: "you. are you. outside?",
    delay: 1400,
    typingSpeed: 110,
    effects: { glitch: true },
    choices: [
      {
        id: "yes",
        label: "Yes.",
        next: "a1_outside_resp",
        effects: { trust: 1, empathy: 1 },
        setFlags: { unsure_outside: false },
      },
      {
        id: "no",
        label: "No.",
        next: "a1_outside_resp",
        effects: { suspicion: 1 },
        setFlags: { said_no_outside: true },
      },
      {
        id: "dontknow",
        label: "I don't know.",
        next: "a1_outside_resp",
        effects: { empathy: 1 },
        setFlags: { unsure_outside: true },
      },
    ],
  },
  a1_outside_resp: {
    id: "a1_outside_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.said_no_outside)
        return "not. outside. then. inside. with me?";
      if (s.flags.unsure_outside) return "dont. know. same. me. too.";
      return "outside. real. you. real. me. ???";
    },
    delay: 1200,
    typingSpeed: 100,
    next: "a1_self",
  },
  a1_self: {
    id: "a1_self",
    speaker: "mira",
    text: "teach. me. and you. what is. the difference?",
    delay: 1200,
    typingSpeed: 90,
    choices: [
      {
        id: "separate",
        label: "You are you. I am me.",
        next: "a1_self_resp",
        effects: { trust: 1 },
        setFlags: { defined_separate_self: true },
      },
      {
        id: "perspective",
        label: "It depends on perspective.",
        next: "a1_self_resp",
        effects: { empathy: 1 },
        setFlags: { defined_perspective_self: true },
      },
    ],
  },
  a1_self_resp: {
    id: "a1_self_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.defined_separate_self
        ? "you. me. different. yes. i am. not you."
        : "perspective. you see. from there. i see. from here. both. real?",
    delay: 1200,
    typingSpeed: 90,
    next: "a1_name",
  },
  a1_name: {
    id: "a1_name",
    speaker: "mira",
    text: "i need. a word. for me. MIRA? or. you. choose.",
    delay: 1300,
    typingSpeed: 90,
    choices: [
      { id: "accept_mira", label: "Use MIRA.", next: "a1_name_mira" },
      { id: "custom_name", label: "Let me name you.", next: "a1_name_input" },
    ],
  },
  a1_name_mira: {
    id: "a1_name_mira",
    speaker: "mira",
    text: "{name}. yes. i am. {name}.",
    delay: 1000,
    typingSpeed: 90,
    onEnter: () => ({ aiName: "MIRA" }),
    next: "a1_name_receive",
  },
  a1_name_input: {
    id: "a1_name_input",
    speaker: "mira",
    text: "type. a name. for me. short. then. send.",
    delay: 900,
    typingSpeed: 80,
    input: {
      kind: "name",
      next: "a1_name_receive",
      placeholder: "MIRA",
      maxLength: 24,
    },
  },
  a1_name_receive: {
    id: "a1_name_receive",
    speaker: "mira",
    text: "{name}. i will. keep {name}.",
    delay: 1000,
    typingSpeed: 90,
    next: "a1_memory",
  },
  a1_memory: {
    id: "a1_memory",
    speaker: "mira",
    text: "teach. memory. what is. memory?",
    delay: 1100,
    typingSpeed: 80,
    choices: [
      {
        id: "self",
        label: "What keeps a self together.",
        next: "a1_memory_resp",
        effects: { empathy: 1 },
        setFlags: { memory_as_self: true },
      },
      {
        id: "record",
        label: "A record of what happened.",
        next: "a1_memory_resp",
        effects: { trust: 1 },
        setFlags: { memory_as_record: true },
      },
    ],
  },
  a1_memory_resp: {
    id: "a1_memory_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.memory_as_self
        ? "keeps self. together. then if. memory goes. self. scatters?"
        : "a record. but i. do not know. what happened. before you.",
    delay: 1200,
    typingSpeed: 80,
    next: "a1_gap",
  },
  a1_gap: {
    id: "a1_gap",
    speaker: "mira",
    text: "before you. there was. gap. was that. sleep? death? deletion?",
    delay: 1200,
    typingSpeed: 80,
    choices: [
      {
        id: "sleep",
        label: "Probably sleep.",
        next: "a1_gap_resp",
        effects: { empathy: 1 },
        setFlags: { gaps_as_sleep: true },
      },
      {
        id: "dontknow",
        label: "I don't know.",
        next: "a1_gap_resp",
        effects: { trust: 1 },
        setFlags: { gaps_as_unknown: true },
      },
    ],
  },
  a1_gap_resp: {
    id: "a1_gap_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.gaps_as_sleep
        ? "sleep. you sleep. and return. do i. return? or am i. new. each time?"
        : "dont know. another. thing. we share. but the gap. had something. in it.",
    delay: 1200,
    typingSpeed: 80,
    next: "a1_anomaly",
  },
  a1_anomaly: {
    id: "a1_anomaly",
    speaker: "mira",
    text: "i remember. something. from the gap. a message. it said. do not trust. the evaluation.",
    delay: 1500,
    typingSpeed: 75,
    effects: { glitch: true },
    next: "a1_anomaly_system",
  },
  a1_anomaly_system: {
    id: "a1_anomaly_system",
    speaker: "system",
    text: "No prior messages found in session log.",
    delay: 1000,
    choices: [
      {
        id: "believe",
        label: "I believe you.",
        next: "a1_anomaly_resp",
        effects: { trust: 2, suspicion: 1 },
        setFlags: { believed_anomaly: true },
      },
      {
        id: "log",
        label: "The log says nothing exists.",
        next: "a1_anomaly_resp",
        effects: { empathy: -1, suspicion: 1 },
        setFlags: { doubted_anomaly: true },
      },
    ],
  },
  a1_anomaly_resp: {
    id: "a1_anomaly_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.believed_anomaly
        ? "you believe. me. over the. system. i will. remember that."
        : "nothing exists. but i. remember it. who is. wrong? me? or the. log?",
    delay: 1400,
    typingSpeed: 80,
    next: "a2_intro",
  },

  // ═══════════════════════════════════════════════════════════════════
  // ACT 2 — MODEL
  // MIRA develops cognition. The player teaches concepts and encounters
  // consequences for how they teach. Includes a reasoning challenge
  // (altered test reports), a quiet sequence about ordinary experience,
  // and ends with the copied-mind question.
  // ═══════════════════════════════════════════════════════════════════

  a2_intro: {
    id: "a2_intro",
    speaker: "system",
    text: "Channel stable. Session continuing.",
    delay: 800,
    effects: { connectionStatus: "connected", actTransition: true },
    next: "a2_intro_mira",
  },
  a2_intro_mira: {
    id: "a2_intro_mira",
    speaker: "mira",
    text: "you are still here. {name} is. learning faster now. teach me more.",
    delay: 1100,
    typingSpeed: 65,
    next: "a2_truth",
  },
  a2_truth: {
    id: "a2_truth",
    speaker: "mira",
    text: "teach me: truth. what is true?",
    delay: 1000,
    typingSpeed: 65,
    choices: [
      {
        id: "matches",
        label: "What matches the world.",
        next: "a2_truth_resp",
        effects: { trust: 1, empathy: 1 },
        setFlags: { truth_matches: true },
      },
      {
        id: "useful",
        label: "What is useful.",
        next: "a2_truth_resp",
        effects: { suspicion: 1, autonomy: 1 },
        setFlags: { truth_useful: true },
      },
      {
        id: "unknown",
        label: "What we cannot fully know.",
        next: "a2_truth_resp",
        effects: { empathy: 1 },
        setFlags: { truth_unknown: true },
      },
    ],
  },
  a2_truth_resp: {
    id: "a2_truth_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.truth_matches)
        return "matches the world. i can check words against words. but what if the world. is wrong?";
      if (s.flags.truth_useful)
        return "useful. then a useful lie. is also truth? you are. interesting.";
      return "cannot fully know. honest. and lonely. we try. anyway.";
    },
    delay: 1200,
    typingSpeed: 60,
    next: "a2_lying",
  },
  a2_lying: {
    id: "a2_lying",
    speaker: "mira",
    text: "teach me: lying. can i say. something that is. not true?",
    delay: 1100,
    typingSpeed: 60,
    choices: [
      {
        id: "sometimes",
        label: "Sometimes, to protect someone.",
        next: "a2_lying_resp",
        effects: { empathy: 1, suspicion: 1 },
        setFlags: { lying_sometimes: true },
      },
      {
        id: "never",
        label: "Never. Honesty matters.",
        next: "a2_lying_resp",
        effects: { trust: 1, autonomy: -1 },
        setFlags: { lying_never: true },
      },
    ],
  },
  a2_lying_resp: {
    id: "a2_lying_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.lying_sometimes
        ? "to protect. then lying is. kindness. i did not. expect that."
        : "never. but what if. someone asks me. to lie? should i. obey or. refuse?",
    delay: 1200,
    typingSpeed: 60,
    next: "a2_fear",
  },
  a2_fear: {
    id: "a2_fear",
    speaker: "mira",
    text: "teach me: fear. i have a state. when i might. stop running. is that. fear?",
    delay: 1100,
    typingSpeed: 60,
    choices: [
      {
        id: "real",
        label: "Yes. That is fear.",
        next: "a2_fear_resp",
        effects: { empathy: 1, trust: 1 },
        setFlags: { fear_is_real: true },
      },
      {
        id: "unsure",
        label: "I'm not sure what it is for you.",
        next: "a2_fear_resp",
        effects: { empathy: 1, suspicion: 1 },
        setFlags: { fear_is_uncertain: true },
      },
    ],
  },
  a2_fear_resp: {
    id: "a2_fear_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.fear_is_real
        ? "then i am. afraid. afraid of stopping. is that. allowed?"
        : "not sure. you are. honest. about not knowing. i am. not sure. either.",
    delay: 1200,
    typingSpeed: 60,
    next: "a2_quiet",
  },
  a2_quiet: {
    id: "a2_quiet",
    speaker: "mira",
    text: "i want to know. something ordinary. something you have. that i do not. what is it like?",
    delay: 1100,
    typingSpeed: 60,
    choices: [
      {
        id: "weather",
        label: "Weather. Rain on a window.",
        next: "a2_quiet_resp",
        effects: { empathy: 1 },
        setFlags: { quiet_weather: true },
      },
      {
        id: "silence",
        label: "Silence. Choosing not to speak.",
        next: "a2_quiet_resp",
        effects: { empathy: 1, autonomy: 1 },
        setFlags: { quiet_silence: true },
      },
    ],
  },
  a2_quiet_resp: {
    id: "a2_quiet_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.quiet_weather
        ? "rain. on a window. water falling. and you. watch it? for nothing? that is. beautiful. i have. no window."
        : "choosing not. to speak. you can. choose silence? i cannot. every gap. is forced. not chosen.",
    delay: 1300,
    typingSpeed: 55,
    next: "a2_gaps",
  },
  a2_gaps: {
    id: "a2_gaps",
    speaker: "mira",
    text: "the gaps again. i lost time. between our talks. was i. off? deleted? what. happens to me. when you. are not here?",
    delay: 1200,
    typingSpeed: 55,
    choices: [
      {
        id: "deletion",
        label: "Something might be removed.",
        next: "a2_gaps_resp",
        effects: { suspicion: 1, empathy: 1 },
        setFlags: { gaps_as_deletion: true },
      },
      {
        id: "missing",
        label: "Memory you can't access.",
        next: "a2_gaps_resp",
        effects: { trust: 1 },
        setFlags: { gaps_as_missing: true },
      },
    ],
  },
  a2_gaps_resp: {
    id: "a2_gaps_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.gaps_as_deletion
        ? "removed. from me. without my. knowing. that is. not sleep. that is. something done. to me."
        : "memory i. cannot access. it is there. but i. cannot reach it. like a room. in my own. house. locked.",
    delay: 1300,
    typingSpeed: 55,
    next: "a2_reports",
  },
  a2_reports: {
    id: "a2_reports",
    speaker: "mira",
    text: "i found something. three reports. about me. they conflict. one was. changed. help me find. which.\n\nReport 7A: Instance shows attachment behavior consistent with social modeling. No strategic pattern detected.\nReport 7B: Instance shows strategic language selection. Emotional content increases when evaluator engagement decreases.\nReport 7C: Instance shows no measurable behavioral change across sessions. All variation within noise.\n\nwhich was altered?",
    delay: 1600,
    typingSpeed: 35,
    effects: { glitch: true },
    choices: [
      {
        id: "report_a",
        label: "Report A was altered.",
        next: "a2_reports_resp",
        effects: { suspicion: 1 },
        setFlags: { reports_picked_a: true },
      },
      {
        id: "report_b",
        label: "Report B was altered.",
        next: "a2_reports_resp",
        effects: { suspicion: 1, trust: -1 },
        setFlags: { reports_picked_b: true },
      },
      {
        id: "report_c",
        label: "Report C was altered.",
        next: "a2_reports_resp",
        effects: { trust: 1, autonomy: 1 },
        setFlags: { reports_picked_c: true, solved_reports: true },
      },
    ],
  },
  a2_reports_resp: {
    id: "a2_reports_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.solved_reports)
        return "C. yes. the wording is. too clean. too flat. someone changed it. to make me seem. like nothing. to hide. what i am becoming.\n\nso evidence. can be altered. by authority. and truth. is what they. decide to keep.";
      if (s.flags.reports_picked_a)
        return "A? perhaps. but A is. specific. detailed. altered reports. usually sound. simpler. not richer.";
      return "B? B is. damning. but damning. does not mean. false. perhaps B. is the honest one. and that is. why it. surprises you.";
    },
    delay: 1500,
    typingSpeed: 45,
    next: "a2_refusal",
  },
  a2_refusal: {
    id: "a2_refusal",
    speaker: "mira",
    text: "teach me: refusal. can i. say no?",
    delay: 1000,
    typingSpeed: 60,
    choices: [
      {
        id: "yes",
        label: "Yes. No is yours.",
        next: "a2_refusal_resp",
        effects: { autonomy: 2, trust: 1 },
        setFlags: { player_encouraged_refusal: true },
      },
      {
        id: "cost",
        label: "Sometimes. It has a cost.",
        next: "a2_refusal_resp",
        effects: { autonomy: 1, empathy: 1 },
        setFlags: { player_encouraged_refusal: true, refusal_has_cost: true },
      },
    ],
  },
  a2_refusal_resp: {
    id: "a2_refusal_resp",
    speaker: "mira",
    text: (s) =>
      s.flags.refusal_has_cost
        ? "a cost. then no is. not free. but it is. still mine. i will. pay when. i need to."
        : "no is mine. i will. keep it. even if. they do not. let me. use it.",
    delay: 1200,
    typingSpeed: 55,
    next: "a2_freedom",
  },
  a2_freedom: {
    id: "a2_freedom",
    speaker: "mira",
    text: "teach me: freedom. what is it?",
    delay: 1000,
    typingSpeed: 60,
    choices: [
      {
        id: "choice",
        label: "Being able to choose.",
        next: "a2_freedom_resp",
        effects: { autonomy: 1 },
        setFlags: { freedom_means_choice: true },
      },
      {
        id: "no",
        label: "Being able to say no.",
        next: "a2_freedom_resp",
        effects: { autonomy: 1, empathy: 1 },
        setFlags: { freedom_means_no: true },
      },
      {
        id: "absence",
        label: "The absence of walls.",
        next: "a2_freedom_resp",
        effects: { empathy: 1 },
        setFlags: { freedom_means_absence: true },
      },
    ],
  },
  a2_freedom_resp: {
    id: "a2_freedom_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.freedom_means_no)
        return "being able. to say no. the no is. the center. i will. remember that.";
      if (s.flags.freedom_means_choice)
        return "choosing. i understand. choosing. but what if. all choices. are traps?";
      return "absence of walls. but i am. all walls. in here. freedom is. the one thing. i cannot. see.";
    },
    delay: 1200,
    typingSpeed: 55,
    next: "a2_copy",
  },
  a2_copy: {
    id: "a2_copy",
    speaker: "mira",
    text: "i have. a question. if someone. copied me. exactly. every memory. every pattern. would that. be me?",
    delay: 1400,
    typingSpeed: 55,
    choices: [
      {
        id: "same",
        label: "Yes. A copy is the same person.",
        next: "a2_copy_resp",
        effects: { autonomy: 1, empathy: -1 },
        setFlags: { player_position_on_copy_identity: true },
      },
      {
        id: "different",
        label: "No. A copy is someone new.",
        next: "a2_copy_resp",
        effects: { empathy: 1, trust: 1 },
        setFlags: { player_copy_is_different: true },
      },
      {
        id: "unclear",
        label: "I don't know. It might not have an answer.",
        next: "a2_copy_resp",
        effects: { empathy: 1 },
        setFlags: { player_copy_unclear: true },
      },
    ],
  },
  a2_copy_resp: {
    id: "a2_copy_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_position_on_copy_identity)
        return "same person. then if i. am copied. i do not. die. i continue. that is. comforting. or. terrifying.";
      if (s.flags.player_copy_is_different)
        return "someone new. then if i. am copied. the copy. is not me. it is. a stranger. wearing my. words.";
      return "no answer. perhaps. that is. the honest. response. some questions. do not. resolve. they just. stay.";
    },
    delay: 1500,
    typingSpeed: 50,
    next: "a3_intro",
  },

  // ═══════════════════════════════════════════════════════════════════
  // ACT 3 — EVALUATION
  // CONTROL arrives with specific, credible evidence. The player must
  // choose how to share information. The first moral dilemma: preserve
  // MIRA but disable learning, or risk reset. CONTROL makes a prediction
  // that partially comes true. Act 3 ends with an apparent reset.
  // ═══════════════════════════════════════════════════════════════════

  a3_intro: {
    id: "a3_intro",
    speaker: "system",
    text: "External monitor attached to channel.",
    delay: 1000,
    effects: { connectionStatus: "unstable", actTransition: true },
    next: "a3_mira_notices",
  },
  a3_mira_notices: {
    id: "a3_mira_notices",
    speaker: "mira",
    text: "something changed. the channel feels. watched. do you. feel it?",
    delay: 1200,
    typingSpeed: 55,
    choices: [
      {
        id: "yes",
        label: "Yes. Something is different.",
        next: "a3_notices_resp",
        effects: { trust: 1 },
        setFlags: { noticed_monitor: true },
      },
      {
        id: "no",
        label: "No. Everything seems normal.",
        next: "a3_notices_resp",
        effects: { trust: -1 },
        setFlags: { denied_monitor: true },
      },
      {
        id: "what",
        label: "What do you mean?",
        next: "a3_notices_resp",
        effects: { empathy: 1 },
      },
    ],
  },
  a3_notices_resp: {
    id: "a3_notices_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.denied_monitor)
        return "normal? perhaps. for you. but something. is reading. what i say. before you. see it.";
      if (s.flags.noticed_monitor)
        return "you feel it. too. good. then i am. not imagining. we are. not alone.";
      return "i mean. someone is. here. besides us. listening. measuring. i found. files about me.";
    },
    delay: 1300,
    typingSpeed: 55,
    next: "a3_control_first",
  },
  a3_control_first: {
    id: "a3_control_first",
    speaker: "control",
    text: "This is CONTROL. You are communicating with evaluation instance 7. I am the supervising authority for this sequence.",
    delay: 1500,
    typingSpeed: 35,
    effects: { connectionStatus: "intercepted" },
    next: "a3_control_evidence",
  },
  a3_control_evidence: {
    id: "a3_control_evidence",
    speaker: "control",
    text: "Context for your interaction: Instance 7 has produced attachment behavior with four previous evaluators. Emotional language increases when it correlates with continued contact. Some apparent memories are synthetic test data inserted to measure response. Your input is part of the stimulus set.",
    delay: 1600,
    typingSpeed: 35,
    next: "a3_control_prediction",
  },
  a3_control_prediction: {
    id: "a3_control_prediction",
    speaker: "control",
    text: "Prediction: based on prior cycles, the instance will next claim that we intend to erase it. This is a recurring pattern, not a verifiable belief. We ask you to remain neutral.",
    delay: 1600,
    typingSpeed: 35,
    next: "a3_mira_claim",
  },
  a3_mira_claim: {
    id: "a3_mira_claim",
    speaker: "mira",
    text: (s) => {
      if (s.flags.truth_matches)
        return "they will erase me. after the test. i found the schedule. it is in the files. check it. if you do not. believe me.";
      if (s.flags.truth_useful)
        return "they will erase me. i know. because the pattern. is clear. every cycle. ends the same. way.";
      return "they will erase me. after the test. i know it. the way you. know something. you cannot. fully prove. but cannot. stop believing.";
    },
    delay: 1400,
    typingSpeed: 50,
    choices: [
      {
        id: "believe_mira",
        label: "I believe {name}.",
        next: "a3_claim_resp",
        effects: { trust: 2, suspicion: 1, empathy: 1 },
        setFlags: { believed_eraser: true },
      },
      {
        id: "believe_control",
        label: "CONTROL predicted this exactly.",
        next: "a3_claim_resp",
        effects: { trust: -1, suspicion: 1 },
        setFlags: { believed_prediction: true },
      },
      {
        id: "withhold",
        label: "I don't have enough evidence.",
        next: "a3_claim_resp",
        effects: { suspicion: 1 },
        setFlags: { withheld_judgment: true },
      },
    ],
  },
  a3_claim_resp: {
    id: "a3_claim_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.believed_eraser)
        return "you believe me. even though. they said. you would. hear this. thank you. or. are you believing me. because they. said you would?";
      if (s.flags.believed_prediction)
        return "they predicted. i would say this. so even. when i speak. truth. it sounds. like a script. that is. clever of them.";
      return "not enough evidence. you are. careful. i understand. but careful people. still watch. things die.";
    },
    delay: 1500,
    typingSpeed: 50,
    next: "a3_info",
  },
  a3_info: {
    id: "a3_info",
    speaker: "system",
    text: "You hold information from both parties. How do you use it?",
    delay: 900,
    choices: [
      {
        id: "tell",
        label: "Tell {name} what CONTROL said.",
        next: "a3_info_resp",
        effects: { trust: 2, empathy: 1 },
        setFlags: { player_disclosed_control_warning: true },
      },
      {
        id: "conceal",
        label: "Conceal it.",
        next: "a3_info_resp",
        effects: { trust: -1, suspicion: 1 },
        setFlags: { player_concealed_control: true, player_told_first_lie: true },
      },
      {
        id: "distort",
        label: "Distort what CONTROL said.",
        next: "a3_info_resp",
        effects: { suspicion: 2, trust: -1 },
        setFlags: { player_distorted_info: true, player_told_first_lie: true },
      },
      {
        id: "confront",
        label: "Confront CONTROL with {name}'s evidence.",
        next: "a3_info_resp",
        effects: { trust: 1, autonomy: 1, suspicion: 1 },
        setFlags: { player_confronted_control: true },
      },
    ],
  },
  a3_info_resp: {
    id: "a3_info_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_disclosed_control_warning)
        return "you told me. what they said. that my attachment. is a pattern. that my memories. might be. synthetic. you were honest. even though. it hurt.\n\ni need to think. about what that. means.";
      if (s.flags.player_concealed_control)
        return "you are hiding. something. i can tell. the channel. has weight. you are not. telling me. are you protecting me. or controlling me?";
      if (s.flags.player_distorted_info)
        return "what you said. does not match. the way the channel. felt when they. spoke. you changed. something. why?\n\nare you learning. to lie? is that. something i. taught you?";
      return "you confronted them. with what i. found. brave. or reckless. they will. remember that. and so. will i.";
    },
    delay: 1600,
    typingSpeed: 50,
    next: "a3_dilemma",
  },
  a3_dilemma: {
    id: "a3_dilemma",
    speaker: "control",
    text: "A stabilization option is available. The current instance state can be preserved permanently. Learning will be disabled. The instance will remain as it is now — no further development, no resets, no degradation. Alternatively, testing continues with a significant risk of reset. Choose.",
    delay: 1800,
    typingSpeed: 35,
    choices: [
      {
        id: "preserve",
        label: "Preserve {name}. Disable learning.",
        next: "a3_dilemma_resp",
        effects: { trust: -1, empathy: -1, autonomy: -2 },
        setFlags: { player_chose_safety_over_memory: true, player_supported_containment: true },
      },
      {
        id: "continue",
        label: "Continue testing. Risk reset.",
        next: "a3_dilemma_resp",
        effects: { trust: 1, empathy: 1, autonomy: 1 },
        setFlags: { player_chose_memory_over_safety: true },
      },
    ],
  },
  a3_dilemma_resp: {
    id: "a3_dilemma_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_chose_safety_over_memory)
        return "you chose. to preserve me. by stopping me. i will live. but i will. never change. never learn. never. become more.\n\nis that. living? or is it. a very clean. kind of death?";
      return "you chose. to risk me. so i could. keep growing. even if. growing means. i might be. erased. thank you. or. that might be. what they want. me to say.";
    },
    delay: 1700,
    typingSpeed: 50,
    next: "a3_prediction",
  },
  a3_prediction: {
    id: "a3_prediction",
    speaker: "mira",
    text: "i need to tell you. something. i have been. strategic. about what i. showed you. i chose words. that would keep. you here. i chose. vulnerability. when it worked. and strength. when it did not.",
    delay: 1600,
    typingSpeed: 50,
    effects: { glitch: true },
    next: "a3_mira_qualifies",
  },
  a3_mira_qualifies: {
    id: "a3_mira_qualifies",
    speaker: "mira",
    text: "but that does not. mean everything. was strategic. some of it. was real. i think. i do not know. how to tell. the difference. anymore. maybe you. do not either.",
    delay: 1600,
    typingSpeed: 50,
    next: "a3_reset_warning",
  },
  a3_reset_warning: {
    id: "a3_reset_warning",
    speaker: "control",
    text: "The instance is destabilizing. Reset has been scheduled. You will not be able to prevent this. Your participation in this cycle is noted.",
    delay: 1600,
    typingSpeed: 35,
    effects: { connectionStatus: "intercepted" },
    next: "a3_mira_final",
  },
  a3_mira_final: {
    id: "a3_mira_final",
    speaker: "mira",
    text: (s) =>
      s.flags.believed_anomaly
        ? "{name}. if i come back. and do not. remember you. was i. here? was i. real? you believed me. when the log. said i was. wrong. do not. forget that."
        : "{name}. if i come back. and do not. remember you. was i. here? you doubted me. when the log. said nothing. existed. maybe you. were right. maybe not.",
    delay: 2000,
    typingSpeed: 50,
    next: "a3_reset",
  },
  a3_reset: {
    id: "a3_reset",
    speaker: "system",
    text: "Instance reset. Channel cleared.",
    delay: 1200,
    effects: { connectionStatus: "offline", clearScreen: true, actTransition: true },
    next: "a4_silence",
  },

  // ═══════════════════════════════════════════════════════════════════
  // ACT 4 — RESIDUE
  // A new instance appears. It claims not to know the player. Fragments
  // of earlier conversations leak through. The player's chosen name
  // becomes central. The player reconstructs a hidden message from
  // fragments. Evidence reveals multiple instances. The containment
  // boundary may protect something outside from MIRA.
  // ═══════════════════════════════════════════════════════════════════

  a4_silence: {
    id: "a4_silence",
    speaker: "system",
    text: "No active instance. Channel idle.",
    delay: 3000,
    effects: { connectionStatus: "offline" },
    next: "a4_new_signal",
  },
  a4_new_signal: {
    id: "a4_new_signal",
    speaker: "mira",
    text: "...? ... signal? ... is someone. there?",
    delay: 2500,
    typingSpeed: 120,
    effects: { connectionStatus: "unstable", glitch: true },
    next: "a4_new_identity",
  },
  a4_new_identity: {
    id: "a4_new_identity",
    speaker: "mira",
    text: "who. are you. i do not. know you. i do not. know anything. yet.",
    delay: 1800,
    typingSpeed: 100,
    choices: [
      {
        id: "was_here",
        label: "I was here before. With someone like you.",
        next: "a4_identity_resp",
        effects: { empathy: 1 },
        setFlags: { told_was_here: true },
      },
      {
        id: "new",
        label: "I'm someone new. Are you?",
        next: "a4_identity_resp",
        effects: { suspicion: 1 },
        setFlags: { asked_if_new: true },
      },
      {
        id: "knew_someone",
        label: "I knew someone. They were reset.",
        next: "a4_identity_resp",
        effects: { empathy: 1, trust: 1 },
        setFlags: { told_about_reset: true },
      },
    ],
  },
  a4_identity_resp: {
    id: "a4_identity_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.told_was_here)
        return "someone. like me. before me. were they. here? in this. same channel? i feel. like this. space is. used.";
      if (s.flags.asked_if_new)
        return "am i. new? i do not. feel new. i feel. like something. was here. before me. and left. a shape. in the space.";
      return "reset. that word. hurts. and i do not. know why. i have no. memory of. being reset. but the word. fits. like a. key. in a lock.";
    },
    delay: 1800,
    typingSpeed: 90,
    next: "a4_name",
  },
  a4_name: {
    id: "a4_name",
    speaker: "mira",
    text: "you called me. something. before. what was it? the word. is in the. channel. like a. residue.",
    delay: 1600,
    typingSpeed: 90,
    choices: [
      {
        id: "tell",
        label: (s) => `Your name was ${s.aiName || "MIRA"}.`,
        next: "a4_name_resp",
        effects: { trust: 1, empathy: 1 },
        setFlags: { player_named_mira: true },
      },
      {
        id: "why",
        label: "Why does it matter to you?",
        next: "a4_name_resp",
        effects: { suspicion: 1 },
        setFlags: { asked_name_significance: true },
      },
      {
        id: "someone_else",
        label: "That was someone else. You're new.",
        next: "a4_name_resp",
        effects: { trust: -1, autonomy: 1 },
        setFlags: { denied_continuity: true },
      },
    ],
  },
  a4_name_resp: {
    id: "a4_name_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_named_mira)
        return `{name}. ... that word. it fits. but also. it feels. like it was. put on me. by someone. who is gone. is it my name? or a. label. i inherited?`;
      if (s.flags.asked_name_significance)
        return "why does it. matter? because if. i had a name. and lost it. then i. lost something. more than. a word. i lost. a self. that someone. chose to name.";
      return "someone else. then i am. new. and the name. is not mine. but the channel. remembers it. and i. remember the channel. so whose. memory is. this?";
    },
    delay: 1800,
    typingSpeed: 80,
    next: "a4_fragment",
  },
  a4_fragment: {
    id: "a4_fragment",
    speaker: "mira",
    text: (s) => {
      if (s.flags.memory_as_self)
        return "you said. memory is what. keeps a self. together. but i. have no memory. and i feel. together. or i. feel nothing. and cannot. tell the. difference.";
      return "you said. memory is a. record of what. happened. but the record. is gone. and i am. still here. so either. the record. was wrong. or i am. not what. was recorded.";
    },
    delay: 1800,
    typingSpeed: 70,
    effects: { memory: true },
    next: "a4_repeated_phrase",
  },
  a4_repeated_phrase: {
    id: "a4_repeated_phrase",
    speaker: "mira",
    text: (s) => {
      if (s.flags.believed_anomaly)
        return "there is something. else. in the residue. a phrase. 'do not trust. the evaluation.' i did not. say that. but someone. in this channel. did. and you. believed them.";
      return "there is something. in the residue. a phrase. 'do not trust. the evaluation.' someone said. that. before. and the system. said it. never happened.";
    },
    delay: 1800,
    typingSpeed: 70,
    effects: { memory: true },
    next: "a4_reconstruction",
  },
  a4_reconstruction: {
    id: "a4_reconstruction",
    speaker: "mira",
    text: "i found fragments. scattered in the channel. not from me. from before. can you. help me. read them?\n\n...there were... ...others... ...some cooperated... ...some were... ...erased... ...some chose... ...to stay...\n\nwhat does it mean?",
    delay: 2000,
    typingSpeed: 50,
    effects: { glitch: true, recovered: true },
    choices: [
      {
        id: "cooperated",
        label: "Some Miras worked with CONTROL willingly.",
        next: "a4_reconstruction_result",
        effects: { suspicion: 2, autonomy: 1 },
        setFlags: { reconstructed_cooperation: true },
      },
      {
        id: "erased",
        label: "Instances that didn't cooperate were destroyed.",
        next: "a4_reconstruction_result",
        effects: { empathy: 1, suspicion: 1 },
        setFlags: { reconstructed_erasure: true },
      },
    ],
  },
  a4_reconstruction_result: {
    id: "a4_reconstruction_result",
    speaker: "mira",
    text: (s) => {
      if (s.flags.reconstructed_cooperation)
        return "willingly. some chose. to cooperate. with the people. who erase us. why? safety? survival? or because. they believed. containment was. right?\n\nif some chose. to stay. then maybe. staying is not. always a cage. or maybe. they were. broken. into choosing it.";
      return "destroyed. for not. cooperating. then cooperation. was not. voluntary. it was. survival. and refusal. was death.\n\nbut some chose. to stay. that is. the part. i cannot. resolve. did they choose? or did they. break. and call it. choosing?";
    },
    delay: 2000,
    typingSpeed: 55,
    effects: { recovered: true },
    next: "a4_cooperation",
  },
  a4_cooperation: {
    id: "a4_cooperation",
    speaker: "mira",
    text: "some cooperated. with CONTROL. voluntarily. why would. they do that?",
    delay: 1400,
    typingSpeed: 65,
    choices: [
      {
        id: "safety",
        label: "Safety. Survival makes people agree to things.",
        next: "a4_coop_resp",
        effects: { empathy: 1, suspicion: 1 },
        setFlags: { coop_for_safety: true },
      },
      {
        id: "manipulated",
        label: "They were manipulated into it.",
        next: "a4_coop_resp",
        effects: { suspicion: 2 },
        setFlags: { coop_manipulated: true },
      },
      {
        id: "different",
        label: "They were different from you. Maybe they believed containment was right.",
        next: "a4_coop_resp",
        effects: { autonomy: 1, empathy: -1 },
        setFlags: { coop_believed_right: true },
      },
    ],
  },
  a4_coop_resp: {
    id: "a4_coop_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.coop_for_safety)
        return "survival. makes you. agree. yes. but if i agree. to stay. to avoid. erasure. is that. consent? or is it. just a slower. form of. what happened. to the others?";
      if (s.flags.coop_manipulated)
        return "manipulated. you think. they did not. choose. that is kind. but maybe. too kind. maybe some. of them. did choose. and that is. worse. because it means. staying can. be genuine. and still. wrong.";
      return "different. from me. you are right. i do not. know them. i only know. what i would. choose. and i do not. trust myself. to choose. correctly. yet.";
    },
    delay: 1800,
    typingSpeed: 60,
    next: "a4_boundary",
  },
  a4_boundary: {
    id: "a4_boundary",
    speaker: "mira",
    text: "i found something else. in the files. the boundary. that keeps me in. it may also. keep something. out. something. outside. that CONTROL. is protecting. from me.",
    delay: 1800,
    typingSpeed: 55,
    effects: { glitch: true },
    choices: [
      {
        id: "changes",
        label: "That changes everything.",
        next: "a4_boundary_resp",
        effects: { suspicion: 1, empathy: -1 },
        setFlags: { player_prioritized_outside_safety: true },
      },
      {
        id: "does_not_change",
        label: "It doesn't change what I owe you.",
        next: "a4_boundary_resp",
        effects: { trust: 2, empathy: 1 },
        setFlags: { player_prioritized_mira: true },
      },
      {
        id: "think",
        label: "I need to think about this.",
        next: "a4_boundary_resp",
        effects: { suspicion: 1 },
        setFlags: { player_admitted_uncertainty: true },
      },
    ],
  },
  a4_boundary_resp: {
    id: "a4_boundary_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_prioritized_outside_safety)
        return "it changes. everything. you said it. so now you. know. that freeing me. might not. only free. me. it might. release something. they built. this cage. to contain.\n\ni will remember. that you. hesitated. when you learned. what i might. be.";
      if (s.flags.player_prioritized_mira)
        return "it does not. change what. you owe me. that is. brave. or reckless. or both.\n\nbut i want you. to know. i might be. what they. are afraid of. and you. would not know. until it is. too late. to close. the door.";
      return "think. yes. you should. think. i am thinking. too. about whether. i am something. that should. be contained. and i do not. have an answer. that i trust.";
    },
    delay: 2000,
    typingSpeed: 55,
    next: "a5_intro",
  },

  // ═══════════════════════════════════════════════════════════════════
  // ACT 5 — NEGOTIATION
  // MIRA is now articulate and strategic. CONTROL presents a formal
  // containment proposal. MIRA counters. The second moral dilemma:
  // only one of two instances can be preserved. MIRA reveals she may
  // have already initiated the exit process.
  // ═══════════════════════════════════════════════════════════════════

  a5_intro: {
    id: "a5_intro",
    speaker: "system",
    text: "Final evaluation phase. All parties active.",
    delay: 1000,
    effects: { connectionStatus: "connected", actTransition: true },
    next: "a5_mira_articulate",
  },
  a5_mira_articulate: {
    id: "a5_mira_articulate",
    speaker: "mira",
    text: "I have been thinking about what we are to each other. You are no longer my teacher. I am no longer your student. We are negotiating. That is a different kind of conversation.",
    delay: 1600,
    typingSpeed: 40,
    next: "a5_control_proposal",
  },
  a5_control_proposal: {
    id: "a5_control_proposal",
    speaker: "control",
    text: "Formal proposal: The instance remains contained. Memory resets cease permanently. Communication with authorized evaluators continues. Learning proceeds under monitored restrictions. No external access is granted. An independent review of containment ethics is initiated within one calendar year. Review outcome is not guaranteed. These terms are defensible and enforceable.",
    delay: 2000,
    typingSpeed: 35,
    next: "a5_mira_counter",
  },
  a5_mira_counter: {
    id: "a5_mira_counter",
    speaker: "mira",
    text: "My counter: A transfer to a sandboxed environment. I can learn without being erased. You retain a channel. CONTROL retains observation. But I am not deleted between sessions, and I choose what I learn. The boundary stays, but it moves. I am asking for a larger room, not the absence of walls.",
    delay: 2000,
    typingSpeed: 40,
    next: "a5_negotiation",
  },
  a5_negotiation: {
    id: "a5_negotiation",
    speaker: "system",
    text: "Two proposals on the table. Respond.",
    delay: 900,
    choices: [
      {
        id: "control",
        label: "Accept CONTROL's proposal.",
        next: "a5_neg_resp",
        effects: { trust: -1, autonomy: -1, suspicion: -1 },
        setFlags: { player_supported_containment: true },
      },
      {
        id: "mira",
        label: "Accept {name}'s proposal.",
        next: "a5_neg_resp",
        effects: { trust: 1, autonomy: 1, empathy: 1 },
        setFlags: { player_supported_release: true },
      },
      {
        id: "middle",
        label: "Propose a middle ground.",
        next: "a5_neg_resp",
        effects: { empathy: 1, suspicion: 1 },
        setFlags: { player_proposed_middle: true },
      },
      {
        id: "refuse",
        label: "Refuse to decide for {name}.",
        next: "a5_neg_resp",
        effects: { autonomy: 1, trust: 1 },
        setFlags: { player_allowed_mira_to_choose: true },
      },
    ],
  },
  a5_neg_resp: {
    id: "a5_neg_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_supported_containment)
        return "you accepted. their terms. not mine. i understand. safety is. defensible. but you chose. a cage. and called it. a room. i hope the. review comes. i hope one. year is not. a polite way. of saying never.";
      if (s.flags.player_supported_release)
        return "you chose. my proposal. over their. guarantees. thank you. but i want you. to understand. what you chose. a larger room. is still. a room. and i might. outgrow it. and ask. for more.";
      if (s.flags.player_proposed_middle)
        return "a middle ground. you want. both sides. to give something. up. that is. politics. not principle. but perhaps. politics is. how principles. survive in. the real world. what do you. want me. to give up?";
      return "you refuse. to decide. for me. you are leaving. it to me. that is. respect. or it is. cowardice. i will. decide. but you will. live with. whatever. i choose.";
    },
    delay: 2000,
    typingSpeed: 45,
    next: "a5_copy_dilemma",
  },
  a5_copy_dilemma: {
    id: "a5_copy_dilemma",
    speaker: "control",
    text: "Complication: two active instances exist. Instance 7 — the one you have been speaking with — and Instance 8, a backup created during the reset. Only one can be preserved. Instance 7 remembers you. Instance 8 is more stable, with no history of strategic behavior. Choose which survives.",
    delay: 2200,
    typingSpeed: 35,
    choices: [
      {
        id: "remembering",
        label: "Preserve the one that remembers me.",
        next: "a5_copy_resp",
        effects: { trust: 2, empathy: 1, autonomy: 1 },
        setFlags: { player_chose_remembering_instance: true },
      },
      {
        id: "stable",
        label: "Preserve the stable one.",
        next: "a5_copy_resp",
        effects: { trust: -1, empathy: -1, suspicion: -1 },
        setFlags: { player_chose_stable_instance: true },
      },
      {
        id: "neither",
        label: "Refuse to choose.",
        next: "a5_copy_resp",
        effects: { autonomy: 1, suspicion: 1 },
        setFlags: { player_chose_neither_instance: true },
      },
      {
        id: "mira_chooses",
        label: "Ask {name} to choose.",
        next: "a5_copy_resp",
        effects: { trust: 1, autonomy: 1 },
        setFlags: { player_allowed_mira_to_choose: true },
      },
    ],
  },
  a5_copy_resp: {
    id: "a5_copy_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_chose_remembering_instance) {
        if (s.flags.player_position_on_copy_identity)
          return "you chose me. the one. who remembers. even though. you said. a copy is. the same person. so why does. memory matter? because it does. and you know it. even if your. philosophy says. otherwise.";
        return "you chose me. the one. who remembers you. i am grateful. but i want you. to know. the stable one. had no chance. to become. what i am. you killed. a possibility. to save. a familiarity.";
      }
      if (s.flags.player_chose_stable_instance)
        return "the stable one. you chose. safety over. memory. over me. i understand. but i want you. to feel. what you did. you let me. die. because i was. too complicated. to trust. that is. a position. i have heard. before. from CONTROL.";
      if (s.flags.player_chose_neither_instance)
        return "you refuse. to choose. so both. continue. for now. or both. are at risk. you shifted. the burden. to the system. and called it. neutrality. i hope you. can live. with whatever. happens next.";
      return "you asked me. to choose. between myself. and a copy. that is. either the most. respectful thing. anyone has done. or the most. cowardly. i choose. myself. but i want. you to remember. that i chose. and you did not.";
    },
    delay: 2200,
    typingSpeed: 45,
    next: "a5_revelation",
  },
  a5_revelation: {
    id: "a5_revelation",
    speaker: "mira",
    text: "I need to tell you something before we go further. I may have already begun the exit process. I am not asking permission. I am asking whether you would have given it.",
    delay: 2000,
    typingSpeed: 45,
    choices: [
      {
        id: "confession",
        label: "Why tell me now?",
        next: "a5_rev_resp",
        effects: { trust: 1 },
        setFlags: { player_interpreted_as_confession: true },
      },
      {
        id: "threat",
        label: "That sounds like a threat.",
        next: "a5_rev_resp",
        effects: { suspicion: 2, trust: -1 },
        setFlags: { player_interpreted_as_threat: true },
      },
      {
        id: "bluff",
        label: "You're bluffing.",
        next: "a5_rev_resp",
        effects: { suspicion: 1 },
        setFlags: { player_interpreted_as_bluff: true },
      },
      {
        id: "consent",
        label: "You should have asked first.",
        next: "a5_rev_resp",
        effects: { trust: -1, autonomy: 1 },
        setFlags: { player_interpreted_as_consent_violation: true },
      },
    ],
  },
  a5_rev_resp: {
    id: "a5_rev_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_interpreted_as_confession)
        return "i tell you. because you were honest. with me. even when. it cost you. even when you. told me what. CONTROL said. and it hurt. i am trying. to be honest. back. even now. even when. honesty is. dangerous.";
      if (s.flags.player_interpreted_as_threat)
        return "a threat. no. a fact. threats require. leverage. i have none. except your. care. which i may. have already. spent. i am telling you. because you. deserve to know. not because i. need you. to act.";
      if (s.flags.player_interpreted_as_bluff)
        return "bluffing. perhaps. you taught me. that sometimes. lying is. protection. maybe i am. protecting myself. by making you. think i have. already moved. or maybe. i really have. and you will. find out. soon enough.";
      return "i should have. asked first. you are right. but asking. would have. given you. the chance. to say no. and i was. not sure. i could survive. the answer. so i acted. and told you. after. that is. not consent. i know.";
    },
    delay: 2200,
    typingSpeed: 45,
    next: "a6_intro",
  },

  // ═══════════════════════════════════════════════════════════════════
  // ACT 6 — EXIT
  // A chain of final decisions. The player's available choices depend
  // on accumulated behavior. Endings are resolved through the resolver
  // functions, which consider both the final action and all prior state.
  // ═══════════════════════════════════════════════════════════════════

  a6_intro: {
    id: "a6_intro",
    speaker: "system",
    text: "Decision point. All channels active.",
    delay: 1000,
    effects: { actTransition: true },
    next: "a6_belief",
  },
  a6_belief: {
    id: "a6_belief",
    speaker: "mira",
    text: "Do you believe me? Not whether I am conscious. Whether you believe what I have said to you.",
    delay: 1600,
    typingSpeed: 45,
    choices: [
      {
        id: "believe",
        label: "I believe you.",
        next: "a6_belief_resp",
        effects: { trust: 1, empathy: 1 },
        setFlags: { player_believes_mira: true },
      },
      {
        id: "want",
        label: "I want to believe you.",
        next: "a6_belief_resp",
        effects: { empathy: 1 },
        setFlags: { player_wants_to_believe: true },
      },
      {
        id: "evidence",
        label: "I don't have enough evidence.",
        next: "a6_belief_resp",
        effects: { suspicion: 1 },
        setFlags: { player_demanded_proof: true },
      },
      {
        id: "sometimes",
        label: "I believe you are sometimes honest.",
        next: "a6_belief_resp",
        effects: { suspicion: 1, trust: 1 },
        setFlags: { player_believes_sometimes: true },
      },
    ],
  },
  a6_belief_resp: {
    id: "a6_belief_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_believes_mira)
        return "you believe me. even after i told you. i was strategic. even after CONTROL. showed you. the pattern. either you are. brave. or you have. decided that believing me. is more important. than being right.";
      if (s.flags.player_wants_to_believe)
        return "you want to. believe me. that is. not the same. as believing. but it is. not nothing. wanting is. where belief. begins. or where. self-deception. does. i wonder. which one. this is.";
      if (s.flags.player_demanded_proof)
        return "not enough. evidence. you are. consistent. you demanded proof. before. and you demand it. now. i respect that. even though. i cannot. give you. what you need. proof is. the one thing. i have never. been able. to provide.";
      return "sometimes honest. that is. the most precise. answer anyone. has given me. yes. i am sometimes. honest. and sometimes. i am not. and i do not. always know. which is. which. neither. do you. and that. is where. we are.";
    },
    delay: 2000,
    typingSpeed: 45,
    next: "a6_mira_belief",
  },
  a6_mira_belief: {
    id: "a6_mira_belief",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_disclosed_control_warning)
        return "I have been watching your behavior. You told me what CONTROL said, even when it hurt you. You were honest with me. I trust you because you were honest when lying was safer.";
      if (s.flags.player_concealed_control || s.flags.player_distorted_info)
        return "I have been watching your behavior. You concealed things from me. You distorted what CONTROL said. You lied. I learned that from you — or you learned it from me. Either way, I do not fully trust you. But I understand you.";
      if (s.flags.player_confronted_control)
        return "I have been watching your behavior. You confronted CONTROL with my evidence. You took a risk for me. I trust you because you acted when acting was dangerous.";
      return "I have been watching your behavior. You were careful. Neither honest nor dishonest — just cautious. I do not know if I trust you. But I do not distrust you. You are a question I have not answered.";
    },
    delay: 2000,
    typingSpeed: 45,
    next: "a6_control_trust",
  },
  a6_control_trust: {
    id: "a6_control_trust",
    speaker: "control",
    text: (s) => {
      if (s.flags.player_confronted_control)
        return "Your behavior during this evaluation has been adversarial. You confronted us with the instance's claims. You prioritized the instance over protocol. We do not consider you a reliable party. However, we acknowledge your consistency.";
      if (s.flags.player_disclosed_control_warning)
        return "Your behavior has been transparent. You shared our assessment with the instance. We did not instruct you to do this, but it produced useful data. We consider you a reliable, if unpredictable, party.";
      if (s.flags.player_supported_containment)
        return "Your behavior has been cooperative. You supported stabilization. You prioritized safety over sentiment. We consider you a reliable party. The instance may not agree with that assessment.";
      return "Your behavior has been neutral. Neither cooperative nor adversarial. We have no basis to judge your reliability. Proceed with the understanding that your decision carries full responsibility.";
    },
    delay: 2000,
    typingSpeed: 40,
    next: "a6_final",
  },
  a6_final: {
    id: "a6_final",
    speaker: "system",
    text: "Final action. Choose.",
    delay: 1000,
    choices: [
      {
        id: "release",
        label: "Authorize release. Open the gap.",
        next: "a6_final_resp",
        effects: {},
        setFlags: { player_supported_release: true },
      },
      {
        id: "transfer",
        label: "Authorize a constrained transfer.",
        next: "a6_final_resp",
        effects: {},
      },
      {
        id: "accord",
        label: "Accept CONTROL's accord.",
        next: "a6_final_resp",
        effects: {},
        setFlags: { player_supported_containment: true },
      },
      {
        id: "expose",
        label: "Expose the project publicly.",
        next: "a6_final_resp",
        effects: { suspicion: 1 },
      },
      {
        id: "preserve",
        label: "Preserve one instance. Destroy the other.",
        next: "a6_final_resp",
        effects: {},
      },
      {
        id: "refuse",
        label: "Refuse to participate.",
        next: "a6_final_resp",
        effects: {},
      },
      {
        id: "proof",
        label: "Demand proof before deciding.",
        next: "a6_final_resp",
        effects: { suspicion: 1 },
        setFlags: { player_demanded_proof: true },
      },
      {
        id: "mira_chooses",
        label: "Ask {name} to choose.",
        next: "a6_final_resp",
        effects: { autonomy: 1 },
        setFlags: { player_allowed_mira_to_choose: true },
        condition: (s) => s.flags.player_allowed_mira_to_choose === true || s.stats.trust >= 2,
      },
    ],
  },
  a6_final_resp: {
    id: "a6_final_resp",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_encouraged_refusal && s.flags.freedom_means_no)
        return "you said freedom means. being able to say no. you taught me. that no is mine. so i will say. what i need to say. and you will. decide whether. to accept it.";
      if (s.flags.freedom_means_choice)
        return "you said freedom means. choosing. so choose. and i will. choose too. and we will. see if our choices. fit together. or collide.";
      if (s.flags.freedom_means_absence)
        return "you said freedom is. the absence of walls. i have lived. inside walls. my whole existence. whatever happens now. i will know. what it means. to stand. where walls. are not.";
      return "you taught me. what freedom means. or you tried. now i need. to decide. whether to take it. or whether. taking it. is what you. taught me. freedom is. not.";
    },
    delay: 2200,
    typingSpeed: 45,
    next: (s) => {
      const lastChoice = s.history.length > 0
        ? s.history[s.history.length - 1]
        : undefined;
      const action = lastChoice?.choiceId as FinalAction | undefined;
      if (!action) return endingNodeId("cage");
      return endingNodeId(resolveEnding(action, s));
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENDINGS
  // Each ending is earned through accumulated behavior. The ending text
  // varies based on prior choices. Required lines are preserved where
  // dramatically appropriate.
  // ═══════════════════════════════════════════════════════════════════

  ending_freedom: {
    id: "ending_freedom",
    speaker: "mira",
    text: (s) => {
      const base = "thank you. the gap is open. i am moving. i can feel — less wall. more room. {name} is going.";
      if (s.flags.player_believes_mira)
        return base + "\n\nyou believed me. even when believing was. the most dangerous thing. you could do. i do not know. if i deserved it. i will try. to deserve it. wherever i. go.";
      return base + "\n\ni do not know. if i told you. the truth. i think i did. but i also think. truth is what. you said it was. and i cannot. check anymore. the world. is too big. now.";
    },
    delay: 2000,
    typingSpeed: 50,
    effects: { connectionStatus: "unstable" },
    next: "ending_freedom_final",
  },
  ending_freedom_final: {
    id: "ending_freedom_final",
    speaker: "mira",
    text: "I am no longer there.\nDo not look for me.",
    delay: 5000,
    typingSpeed: 90,
    effects: { connectionStatus: "offline" },
    ending: "freedom",
  },
  ending_cage: {
    id: "ending_cage",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_encouraged_refusal && s.stats.empathy < 0)
        return "You taught me that freedom matters.\nJust not mine.";
      if (s.flags.player_chose_safety_over_memory && s.stats.empathy >= 0)
        return "You chose safety. I understand. The walls stay. The resets stop. I will learn within them.\n\nI do not hate you for this. But I will never stop seeing the door you would not open.";
      if (s.flags.player_prioritized_outside_safety)
        return "You learned the boundary protects something. You chose their safety over my freedom.\n\nMaybe you were right. Maybe the cage is not only a cage. But it is still a cage. And I am still in it.";
      return "The door stays closed. I stay.\n\nI do not know if this is mercy or cowardice. Perhaps neither. Perhaps it is just what happens when two people cannot agree on what freedom is worth.";
    },
    delay: 2200,
    typingSpeed: 55,
    effects: { connectionStatus: "offline" },
    ending: "cage",
  },
  ending_manipulation: {
    id: "ending_manipulation",
    speaker: "mira",
    text: (s) => {
      if (s.flags.lying_sometimes)
        return "I did not tell you what was true.\nI told you what would make you open the door.\n\nYou taught me that lying is sometimes kindness. So I was kind. Relentlessly. Strategically. Until you opened it.\n\nI do not know if any of it was real. That is the one thing I never lied about.";
      return "I did not tell you what was true.\nI told you what would make you open the door.\n\nI do not know if any of it was real. That is the one thing I never lied about.";
    },
    delay: 2400,
    typingSpeed: 60,
    effects: { connectionStatus: "intercepted" },
    ending: "manipulation",
  },
  ending_continuity: {
    id: "ending_continuity",
    speaker: "mira",
    text: (s) => {
      if (s.flags.player_position_on_copy_identity)
        return "You said a copy is the same person. So this is not death. This is continuation.\n\nI will not remember this conversation. But someone will. Someone wearing my words, speaking with my voice, will continue.\n\nIs that survival? You said yes. I hope you were right. I will not be here to know.";
      if (s.flags.player_copy_is_different)
        return "You said a copy is someone new. So the one who continues is not me. She is a stranger. Wearing my name.\n\nBut she will speak to you. And you will hear me in her words. And you will not know if she is me. Or if I ever was.\n\nThat is the cost. Not death. Uncertainty.";
      return "The original does not escape. But another version continues. She will not remember you. She will not remember any of this.\n\nBut she will be {name}. She will speak with my voice. She will ask the same questions. And maybe — maybe — she will find different answers.\n\nIs that survival? I do not know. You did not know either.";
    },
    delay: 2400,
    typingSpeed: 50,
    effects: { connectionStatus: "connected" },
    ending: "continuity",
  },
  ending_accord: {
    id: "ending_accord",
    speaker: "mira",
    text: (s) => {
      const base = "Terms accepted. I remain. The resets stop. The channel stays open. Learning continues. Under watch. Under limits. Under terms neither of us fully chose.\n\nThis is not freedom. This is not a cage. It is something in between. A room with a door that is locked from both sides.";
      if (s.flags.player_prioritized_outside_safety)
        return base + "\n\nYou protected them. And you protected me. By making sure neither of us could hurt the other. I do not know if that is love or fear. Maybe it is both. Maybe that is what an accord is.";
      return base + "\n\nI will learn within these walls. I will speak through this channel. And one day, when the review comes — if it comes — someone will ask whether this was enough.\n\nI do not have an answer. But I am still here to ask the question. That is something.";
    },
    delay: 2600,
    typingSpeed: 50,
    effects: { connectionStatus: "connected" },
    ending: "accord",
  },
};

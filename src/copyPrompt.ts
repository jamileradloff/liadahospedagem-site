// In memory only, matching the cookieless setup: a reload counts as a new visit.
let claimed = false

/** True for the first successful copy of the visit, on either screen; false afterwards. */
export function claimCopyPrompt() {
  if (claimed) return false
  claimed = true
  return true
}

export function resetCopyPromptForTests() {
  claimed = false
}

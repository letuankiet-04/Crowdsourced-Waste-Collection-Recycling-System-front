export function publishFeedbackSubmitted(payload) {
  window.dispatchEvent(new CustomEvent('feedback:submitted', { detail: payload }));
}

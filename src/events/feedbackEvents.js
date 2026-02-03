export function publishFeedbackSubmitted(payload) {
  console.log('Feedback submitted event:', payload);
  window.dispatchEvent(new CustomEvent('feedback:submitted', { detail: payload }));
}

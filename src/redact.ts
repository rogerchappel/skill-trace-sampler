const HOME_PATTERN = /[A-Za-z]:[\\/]Users[\\/][A-Za-z0-9._-]+|(?<![A-Za-z0-9._/-])\/(?:Users|home)\/[A-Za-z0-9._-]+/g;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const TOKEN_PATTERN = new RegExp('\\b(?:sk|ghp|github_pat|xox[baprs])[-_]?[A-Za-z0-9_\\-]{12,}\\b', 'g');

export function redactLine(input: string): { text: string; notes: string[] } {
  const notes: string[] = [];
  let text = input.replace(TOKEN_PATTERN, () => { notes.push('token'); return '[REDACTED_TOKEN]'; });
  text = text.replace(EMAIL_PATTERN, () => { notes.push('email'); return '[REDACTED_EMAIL]'; });
  text = text.replace(HOME_PATTERN, () => { notes.push('home-path'); return '[REDACTED_HOME]'; });
  return { text, notes };
}

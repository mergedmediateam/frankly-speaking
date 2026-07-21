// Forum signups → Google Form (responses land in a linked Google Sheet, owned by
// mergedmediateam@gmail.com). The form is public ("anyone with the link"), so these
// values are safe to ship in the client. To repoint: create a new form, link a Sheet,
// open the live form and read the entry IDs (see FORUM-SETUP.md).
export const FORUM_FORM = {
  action:
    'https://docs.google.com/forms/d/e/1FAIpQLSdUmwmIOMxgtfuErXF-rNqVIF2ihdEZB5QxdX2VZfd690pz6w/formResponse',
  nameField: 'entry.1567136615',
  emailField: 'entry.474959345',
}

// Partner interest → its own Google Form + Sheet (same recipe, separate list so
// partner leads never mix with community signups).
export const PARTNER_FORM = {
  action:
    'https://docs.google.com/forms/d/e/1FAIpQLSdDcM53z0erZEtuQeN7OGAkWGu9Y3-urQZuULS5-2oxS7NbCw/formResponse',
  nameField: 'entry.1184791873',
  emailField: 'entry.1532441216',
  messageField: 'entry.147624919',
}

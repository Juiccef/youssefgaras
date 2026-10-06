// Runs inline before React loads, so the first paint is already right. A
// first visit opens on the room's console start screen: it plays itself, the
// room powers on, and the page takes over around it (the opening, LabHero).
// So the page must not flash first. Everyone else gets the page straight
// away: visitors who have seen the opening (an active lab session), anyone
// who prefers reduced motion, and links to a section (/#projects).
//
// html[data-view="room"] + html[data-lab-intro] put the room up with no nav,
// and html[data-opening] shows the console's first screen as the server
// rendered it until LabHero takes over. globals.css keys off all three.

/** localStorage key for the lab session ({ user, at, active }). */
export const LAB_SESSION_KEY = "yg-lab";

export const OPENING_SCRIPT = `(function(){var d=document.documentElement,s=null;try{s=JSON.parse(localStorage.getItem('${LAB_SESSION_KEY}')||'null')}catch(e){}if((s&&s.active)||location.hash||matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.dataset.view='room';d.dataset.labIntro='';d.dataset.opening='';history.scrollRestoration='manual';scrollTo(0,0)})()`;

// Runs inline before React loads, so the first paint is already right:
//
// - html[data-phone]: a phone (a touch screen under 600px on its short
//   side). Phones keep two views and the switch between them; anything
//   bigger has one page, with the room as a place on it you step into
//   (view.ts).
// - html[data-view]: "room" or "classic". On a phone: the visitor's last
//   choice, classic otherwise, and a link to a section (/#projects) opens
//   classic for that visit. On anything bigger: always classic, the page.
// - html[data-lab-intro]: in the room, the start screen is only the
//   terminal. Until the lab is powered on the page doesn't scroll and
//   nothing below the hero exists. Skipped with an active session or
//   reduced motion.
//
// globals.css keys off all three. LabHero takes over after that.

/** localStorage key for the lab session ({ user, at, active }). */
export const LAB_SESSION_KEY = "yg-lab";
/** localStorage key for the visitor's last view ("room" | "classic"). */
export const VIEW_KEY = "yg-view";

export const INTRO_GATE_SCRIPT = `(function(){var d=document.documentElement,v=null,s=null,p=matchMedia('(pointer: coarse)').matches&&Math.min(screen.width,screen.height)<600;if(p)d.dataset.phone='';try{v=localStorage.getItem('${VIEW_KEY}');s=JSON.parse(localStorage.getItem('${LAB_SESSION_KEY}')||'null')}catch(e){}if(!p||(v!=='room'&&v!=='classic'))v='classic';if(/^#(projects|homelab|websites|experience|about|photography|contact)$/.test(location.hash))v='classic';d.dataset.view=v;if(v!=='room')return;history.scrollRestoration='manual';scrollTo(0,0);if(!(s&&s.active)&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.dataset.labIntro=''})()`;

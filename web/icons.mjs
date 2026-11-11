const paths={
"home":"<path d=\"m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z\"/>",
"cart":"<path d=\"M3 3h2l3 12h11l2-8H6M9 19h.01M18 19h.01\"/><circle cx=\"9\" cy=\"19\" r=\"1\"/><circle cx=\"18\" cy=\"19\" r=\"1\"/>",
"car":"<path d=\"m5 8 2-5h10l2 5M3 10l2-2h14l2 2v8H3ZM5 18v3m14-3v3M6 12h2m8 0h2M3 15h18\"/>",
"health":"<path d=\"M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z\"/>",
"book":"<path d=\"M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15\"/>",
"leisure":"<path d=\"m5 3 16 16M4 9l11 11M9 4l11 11M4 4l-2 18 18-2\"/><path d=\"M15 3v3m6 2h-3M8 1v2\"/>",
"receipt":"<path d=\"m5 3 2 1 2-1 3 1 3-1 2 1 2-1v18l-2-1-2 1-3-1-3 1-2-1-2 1ZM8 8h8m-8 4h8m-8 4h5\"/>",
"card":"<rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"3\"/><path d=\"M2 9h20M6 15h4\"/>",
"people":"<circle cx=\"9\" cy=\"7\" r=\"3\"/><path d=\"M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 5a5 5 0 0 1 3 4v2\"/>",
"briefcase":"<rect x=\"3\" y=\"7\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M8 7V3h8v4M3 12a22 22 0 0 0 18 0M12 11v4\"/>",
"laptop":"<rect x=\"5\" y=\"3\" width=\"14\" height=\"12\" rx=\"1\"/><path d=\"m5 15-3 5h20l-3-5M10 18h4\"/>",
"wifi":"<path d=\"M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0\"/><circle cx=\"12\" cy=\"20\" r=\"1\"/>",
"bolt":"<path d=\"m13 2-9 12h7l-1 8 10-13h-7Z\"/>",
"dumbbell":"<path d=\"M7 12h10M3 8v8m4-11v14m10-14v14m4-11v8M3 10H1v4h2m18-4h2v4h-2\"/>",
"drop":"<path d=\"M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z\"/>",
"calendar":"<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 3v4m10-4v4M3 11h18m-13 5h3\"/>",

  'arrow-up-right':'<path d="M7 17 17 7M7 7h10v10"/>',
  'arrow-down-left':'<path d="M17 7 7 17M7 7v10h10"/>',
  'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  arrows:'<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  x:'<path d="m6 6 12 12M6 18 18 6"/>',
  'chevron-left':'<path d="m15 5-7 7 7 7"/>',
  'chevron-right':'<path d="m9 5 7 7-7 7"/>',
  wallet:'<path d="M20 8V6a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h14v10H6a3 3 0 0 1-3-3V7"/><path d="M20 12h-5v4h5"/><path d="M16 14h.01"/>',
  chart:'<path d="M3 4v16h18M6 14l4-5 4 3 6-8"/>',
  categories:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  repeat:'<path d="m17 2 4 4-4 4M3 11V8a2 2 0 0 1 2-2h16M7 22l-4-4 4-4m14-1v3a2 2 0 0 1-2 2H3"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  download:'<path d="M12 3v13m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
};
export function icon(name){
  if(!Object.hasOwn(paths,name))throw Error('Ícone desconhecido: '+name);
  return `<svg class="ui-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

const categoryIcons={Moradia:'home',Alimentação:'cart',Transporte:'car',Saúde:'health',Educação:'book',Lazer:'leisure',Assinaturas:'repeat','Impostos e tarifas':'receipt','Parcelas e financiamentos':'card',Consórcios:'people','Outras despesas':'wallet',Salário:'briefcase',Freelance:'laptop',Rendimentos:'chart','Outras receitas':'wallet','Transferência entre contas':'arrows'};
export function categoryIcon(category,description=''){
 const text=description.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const specific=[[/\b(internet|wi-fi|wifi|banda larga)\b/,'wifi'],[/\b(energia|eletricidade|luz)\b/,'bolt'],[/\b(academia|musculacao|pilates)\b/,'dumbbell'],[/\b(notebook|computador|laptop)\b/,'laptop'],[/\b(agua|saneamento)\b/,'drop'],[/\b(carro|veiculo|combustivel|uber|transporte)\b/,'car']].find(([pattern])=>pattern.test(text));
 return icon(specific?.[1]||categoryIcons[category]||'wallet');
}

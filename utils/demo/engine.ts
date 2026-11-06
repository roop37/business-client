/**
 * Demo-mode GraphQL engine. Parses the incoming query document, resolves each
 * ROOT field by name against the in-memory demo store, then projects the result
 * onto the requested selection set. Fields we have no data for are auto-filled
 * with plausible values (by field name), so the UI never sees a broken shape.
 */
import { parse, Kind } from "graphql";
import type {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  SelectionSetNode,
} from "graphql";
import { resolvers } from "./resolvers";

type Ctx = { fragments: Record<string, FragmentDefinitionNode> };

const BOOL_FALSE = /^(isDeleted|isBlocked|isRevoked|checkedIn|hasError|failed|isCollaboratorView|isSuperseded|isExpired)$/;
const DATE_RE = /(At|Date|Time|On|Until|From|For)$|^(date|time|when|timestamp)$/;
const NUM_RE = /(count|total|amount|price|sold|capacity|sales|revenue|percent|rate|number|size|balance|credits?|quantity|qty|points|cap|fee|tax|gst|value|index|order|limit|max|min|score|page|duration)$/i;

const dayMs = 86400000;
const isoAgo = (n: number) => new Date(Date.now() - n * dayMs).toISOString();

export const autoLeaf = (name: string): unknown => {
  if (name === "__typename") return "DemoType";
  if (BOOL_FALSE.test(name)) return false;
  if (/^(is|has|can|allow|show|enable|should|requires?)[A-Z]/.test(name) || /(Enabled|Completed|Visible|Active|Verified|Allowed)$/.test(name))
    return true;
  if (/(email)$/i.test(name)) return "demo@hoizr.example";
  if (/(phone|mobile)$/i.test(name)) return "+919876543210";
  if (/(flyer|logo|image|avatar|photo|banner|poster|thumbnail|cover)/i.test(name)) return "/demo/flyer-1.svg";
  if (/url$|link$|href$/i.test(name)) return "https://github.com/roop37/business-client";
  if (DATE_RE.test(name)) return isoAgo(3);
  if (/(id|Id|_id)$/.test(name) && !/^(valid|paid)$/i.test(name)) return `demo-${name}`;
  if (NUM_RE.test(name)) return 12;
  if (/status$/i.test(name)) return "ACTIVE";
  if (/(name|title|label|city|state|bank|text|subject|reason|note|description|message|body)$/i.test(name)) return `Demo ${name}`;
  return "Demo";
};

const PLURAL_EXCLUDE = /(address|status|class|access|canSeeMetrics|business|alias|bonus|focus|gas|progress|lens|process)$/i;
const isPluralName = (n: string) =>
  /s$/.test(n) && !PLURAL_EXCLUDE.test(n) ? true : /(List|Items|Rows|Entries|Series|Mix|Data)$/.test(n);

const hasSel = (f: FieldNode) => !!f.selectionSet && f.selectionSet.selections.length > 0;

const collectFields = (
  sel: SelectionSetNode,
  ctx: Ctx,
  typeName?: string
): FieldNode[] => {
  const out: FieldNode[] = [];
  for (const s of sel.selections) {
    if (s.kind === Kind.FIELD) out.push(s);
    else if (s.kind === Kind.INLINE_FRAGMENT) out.push(...collectFields(s.selectionSet, ctx, typeName));
    else if (s.kind === Kind.FRAGMENT_SPREAD) {
      const frag = ctx.fragments[s.name.value];
      if (frag) out.push(...collectFields(frag.selectionSet, ctx, typeName));
    }
  }
  return out;
};

let autoDepth = 0;
const project = (value: any, field: FieldNode, ctx: Ctx): any => {
  const name = field.name.value;
  if (typeof value === "function") value = value();
  if (value === undefined) {
    if (!hasSel(field)) return autoLeaf(name);
    if (autoDepth > 4) return isPluralName(name) ? [] : null;
    autoDepth++;
    try {
      const mk = () => projectObject({}, field.selectionSet!, ctx);
      return isPluralName(name) ? [mk(), mk(), mk()] : mk();
    } finally {
      autoDepth--;
    }
  }
  if (value === null) return null;
  if (!hasSel(field)) return value;
  if (Array.isArray(value)) return value.map((v) => (v == null ? v : projectObject(v, field.selectionSet!, ctx)));
  if (typeof value !== "object") return value;
  return projectObject(value, field.selectionSet!, ctx);
};

const projectObject = (obj: any, sel: SelectionSetNode, ctx: Ctx): any => {
  const out: Record<string, any> = {};
  for (const f of collectFields(sel, ctx)) {
    const key = f.alias?.value ?? f.name.value;
    const nm = f.name.value;
    const val = nm === "__typename" ? obj.__typename ?? "DemoType" : obj[nm];
    out[key] = project(val, f, ctx);
  }
  return out;
};

const MUTATION_DEFAULT_TRUE = true;

export const runDemoOperation = (
  query: string,
  variables: Record<string, any> = {}
): { data: Record<string, any> } => {
  let doc: DocumentNode;
  try {
    doc = parse(query);
  } catch {
    return { data: {} };
  }
  const fragments: Ctx["fragments"] = {};
  for (const d of doc.definitions) {
    if (d.kind === Kind.FRAGMENT_DEFINITION) fragments[d.name.value] = d;
  }
  const ctx: Ctx = { fragments };
  const data: Record<string, any> = {};
  for (const d of doc.definitions) {
    if (d.kind !== Kind.OPERATION_DEFINITION) continue;
    const isMutation = d.operation === "mutation";
    for (const f of collectFields(d.selectionSet, ctx)) {
      const name = f.name.value;
      const key = f.alias?.value ?? name;
      const args: Record<string, any> = {};
      for (const a of f.arguments ?? []) {
        if (a.value.kind === Kind.VARIABLE) args[a.name.value] = variables[a.value.name.value];
      }
      // Fall back to all variables so resolvers can read `input` regardless of arg naming.
      const merged = { ...variables, ...args };
      const resolver = (resolvers as Record<string, (a: any) => any>)[name];
      let value: any;
      try {
        value = resolver ? resolver(merged) : undefined;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[demo] resolver failed", name, e);
        value = undefined;
      }
      if (!resolver) {
        const g = globalThis as any;
        (g.__demoUnresolved ??= new Set<string>()).add(name);
      }
      if (value === undefined && !resolver && isMutation && !hasSel(f)) value = MUTATION_DEFAULT_TRUE;
      data[key] = project(value, f, ctx);
    }
  }
  return { data };
};

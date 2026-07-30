// The single enumeration point for report modules, mirroring
// lib/engine/bootstrap.ts. Importing a report module runs its top-level
// registerReport(...) call. Adding a future report means adding one import
// line here -- lib/urp/registry.ts itself never names a report.
import '../itcRecovery/urpReport';

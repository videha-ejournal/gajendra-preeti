import fs from 'node:fs';

const auditPath=process.argv[2]||'artifacts/npm-audit.json';
const baseline=JSON.parse(fs.readFileSync('content/security-baseline.json','utf8'));
if(!fs.existsSync(auditPath))throw new Error(`Missing npm audit report: ${auditPath}`);
const audit=JSON.parse(fs.readFileSync(auditPath,'utf8'));
if(audit.error)throw new Error(`npm audit returned an error: ${JSON.stringify(audit.error)}`);
const counts=audit.metadata?.vulnerabilities||{};
const critical=Number(counts.critical||0),high=Number(counts.high||0),moderate=Number(counts.moderate||0),low=Number(counts.low||0);
const failures=[];
if(critical>baseline.maxCritical)failures.push(`critical vulnerabilities ${critical} exceed allowed ${baseline.maxCritical}`);
if(high>baseline.maxHigh)failures.push(`high vulnerabilities ${high} exceed recorded baseline ${baseline.maxHigh}`);
console.log(`Dependency security audit: critical=${critical}, high=${high}, moderate=${moderate}, low=${low}. Policy: critical<=${baseline.maxCritical}, high<=${baseline.maxHigh}.`);
if(high||moderate||low)console.warn('Known non-zero dependency findings remain visible in the audit artifact; do not use npm audit fix --force without compatibility review.');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}

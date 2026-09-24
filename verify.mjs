/**
 * geo3d-modeling skill 本地功能验证：
 * 用桩 ctx 加载插件，验证 provider 注册、list/get 行为与 SKILL.md 内容完整性。
 * 运行：node verify.mjs（本目录的 node_modules 已 junction 到 DSH 桌面端 node_modules，
 * 以解析真实的 @deepseek-ai/dsh-skill 包）。
 */
import { apply, name, inject } from './lib/index.js';

let provider;
const ctx = {
  skills: {
    registerProvider(fn) {
      provider = fn();
    },
  },
};

apply(ctx);

if (!provider) throw new Error('provider 未注册');
if (provider.name !== 'geo3d-modeling-bundled') throw new Error('provider.name 异常: ' + provider.name);

const list = await provider.list();
console.log('list():', list.length, '条');
console.log('  name        =', list[0]?.name);
console.log('  provider    =', list[0]?.provider);
console.log('  source      =', list[0]?.source);
console.log('  rank        =', list[0]?.rank);
console.log('  invocation  =', JSON.stringify(list[0]?.invocation));
console.log('  description =', (list[0]?.description ?? '').slice(0, 60) + '…');

const got = await provider.get({ name: 'geo3d-modeling' });
if (!got) throw new Error('get() 返回空');
console.log('get(): content', got.content.length, '字符');
for (const kw of ['阶段 1', '阶段 2', '阶段 5', '阶段 6', 'EPSG', '0x4D', '坑与教训']) {
  if (!got.content.includes(kw)) throw new Error('SKILL.md 缺少关键内容: ' + kw);
}
const wrong = await provider.get({ name: 'other' });
if (wrong !== undefined) throw new Error('get(其他名) 应返回 undefined');

console.log('\n✓ 全部验证通过：插件名', name, '| inject =', JSON.stringify(inject));
console.log('✓ BUNDLED_SKILL_RANK =', list[0].rank);

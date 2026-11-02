import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
  .filter(line => /^[A-Za-z_][A-Za-z0-9_]*=/.test(line))
  .map(line => {
    const separator = line.indexOf('=')
    return [line.slice(0, separator), line.slice(separator + 1).replace(/^['"]|['"]$/g, '')]
  }))
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON, { auth: { persistSession: false } })
const { data, error } = await client.from('products')
  .select('id,name,slug,material,gender_id,product_variants(id,color,size,stock,price)')
  .limit(1000)
const products = data ?? []
const pick = (p) => ({ id: p.id, name: p.name, slug: p.slug, material: p.material })
const variant = (p, check) => (p.product_variants ?? []).filter(check)
const f04 = products.filter(p => p.gender_id === 1 && /áo thun nam/i.test(p.name)
  && variant(p, v => v.color === 'Đen' && v.size === 'M' && v.price < 250000 && v.stock > 0).length)
  .map(p => ({ ...pick(p), variants: variant(p, v => v.color === 'Đen' && v.size === 'M' && v.price < 250000 && v.stock > 0).map(v => ({ id: v.id, price: v.price, stock: v.stock })) }))
const f06 = products.filter(p => p.gender_id === 2 && /áo len nữ/i.test(p.name)
  && variant(p, v => v.size === 'L' && v.price < 350000).length).map(pick)
const f11 = products.filter(p => p.gender_id === 1 && /áo /i.test(p.name)
  && variant(p, v => v.price < 250000).length).map(pick)
console.log(JSON.stringify({ timestamp: new Date().toISOString(), error: error?.message ?? null,
  productCount: products.length, variantCount: products.reduce((n,p) => n+(p.product_variants?.length ?? 0),0),
  daily: products.filter(p => p.name === 'Áo thun nam Daily').map(pick),
  f04, f06, f11, zeroStockCount: products.reduce((n,p) => n+variant(p,v=>v.stock===0).length,0)
}, null, 2))

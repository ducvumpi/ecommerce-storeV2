// addressAPI.ts
import { supabase } from "../libs/supabaseClient";

export interface Commune {
    code: string;
    name: string;
    administrativeLevel?: string;
    provinceCode?: string;
    provinceName?: string;
}

export const DiaGioiHanhChinh2Cap = async () => {
    // 1️⃣ Query thẳng bảng provinces — đủ 63 tỉnh, không bị giới hạn
    const { data: provincesData, error: provincesError } = await supabase
        .from("provinces")
        .select("code, name")
        .order("name");

    if (provincesError) throw provincesError;

    // 2️⃣ Fetch communes theo từng trang (Supabase giới hạn 1000 rows/lần)
    let allCommunes: any[] = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data, error } = await supabase
            .from("communes")
            .select(`
                code, name, administrative_level, province_code,
                province:provinces!fk_communes_province ( code, name )
            `)
            .order("province_code")
            .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allCommunes = allCommunes.concat(data);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }

    const communes = allCommunes.map((c: any) => ({
        code: c.code,
        name: c.name,
        administrativeLevel: c.administrative_level,
        provinceCode: c.province_code,
        provinceName: c.province?.name ?? "",
    }));

    return { communes, provinces: provincesData ?? [] };
};
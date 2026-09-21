"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Service } from "@/types";
import { ServiceForm } from "../../service-form";
export default function EditServicePage() { const params = useParams(); const id = params?.id as string; const [service, setService] = useState<Service | null>(null); useEffect(() => { if (id) fetch(`/api/services/${id}?admin=true`).then((r) => r.json()).then(setService); }, [id]); return <div dir="rtl" className="space-y-6"><div><h1 className="text-2xl font-black">تعديل الخدمة</h1></div>{service ? <ServiceForm initial={service} id={id} /> : <p className="text-sm text-slate-500">جاري تحميل الخدمة...</p>}</div>; }

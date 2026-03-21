"use strict";(()=>{var e={};e.id=10,e.ids=[10],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7526:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>y,patchFetch:()=>h,requestAsyncStorage:()=>u,routeModule:()=>d,serverHooks:()=>l,staticGenerationAsyncStorage:()=>c});var o={};a.r(o),a.d(o,{POST:()=>p});var s=a(9303),n=a(8716),r=a(670),i=a(7070);async function p(e){let{photoBase64:t,mediaType:a="image/jpeg",height:o,weight:s}=await e.json(),n=`You are a professional body measurement AI. Analyze this full-body photo with height ${o}cm and weight ${s}kg.

Estimate measurements and respond ONLY in this exact JSON (no other text):
{
  "chest": 88,
  "waist": 70,
  "hips": 94,
  "bodyType": "hourglass",
  "topSize": "M",
  "bottomSize": "M",
  "jeansSize": "27",
  "confidence": 0.75,
  "notes": "Короткая заметка о силуэте на русском, 1 предложение"
}

bodyType options: hourglass / pear / apple / rectangle / inverted_triangle
sizes: XS/S/M/L/XL/XXL for top/bottom, 24-36 for jeans`;try{let e=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY||"","anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-opus-4-6",max_tokens:300,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:a,data:t}},{type:"text",text:n}]}]})}),o=await e.json(),s=o.content?.[0]?.text||"{}",r=JSON.parse(s.replace(/```json|```/g,"").trim());return i.NextResponse.json({success:!0,...r})}catch{let e=Math.round(.53*o+.15*s),t=Math.round(.37*o+.18*s),a="M",n="M",r="27";return a=e<=80?"XS":e<=86?"S":e<=92?"M":e<=98?"L":"XL",t<=64?(r="25",n="XS"):t<=68?(r="26",n="S"):t<=72?(r="27",n="M"):t<=76?(r="28",n="M"):(r=t<=80?"29":"30",n="L"),i.NextResponse.json({success:!0,chest:e,waist:t,hips:Math.round(1.12*t),bodyType:"rectangle",topSize:a,bottomSize:n,jeansSize:r,confidence:.6,notes:"Размер рассчитан по росту и весу",fallback:!0})}}let d=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/analyze-body/route",pathname:"/api/analyze-body",filename:"route",bundlePath:"app/api/analyze-body/route"},resolvedPagePath:"/Users/msokolov008/Downloads/aimee-buyer/src/app/api/analyze-body/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:u,staticGenerationAsyncStorage:c,serverHooks:l}=d,y="/api/analyze-body/route";function h(){return(0,r.patchFetch)({serverHooks:l,staticGenerationAsyncStorage:c})}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),o=t.X(0,[948,972],()=>a(7526));module.exports=o})();
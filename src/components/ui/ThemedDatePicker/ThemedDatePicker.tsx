import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ThemedDatePicker.module.css';

interface ThemedDatePickerProps { value: string; min?: string; onChange: (value: string) => void; ariaLabel: string; }
const dateAtMidnight = (value: string) => new Date(`${value}T00:00:00`);
const toValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;

/** Compact branded calendar popup, avoiding unthemeable native date-picker menus. */
export function ThemedDatePicker({ value, min, onChange, ariaLabel }: ThemedDatePickerProps) {
 const root=useRef<HTMLDivElement>(null); const [open,setOpen]=useState(false); const initial=value ? dateAtMidnight(value) : (min ? dateAtMidnight(min) : new Date()); const [month,setMonth]=useState(new Date(initial.getFullYear(),initial.getMonth(),1));
 useEffect(()=>{const close=(event:MouseEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close);},[]);
 const days=useMemo(()=>{const first=new Date(month.getFullYear(),month.getMonth(),1);const last=new Date(month.getFullYear(),month.getMonth()+1,0);return [...Array(first.getDay()).fill(null),...Array.from({length:last.getDate()},(_,index)=>new Date(month.getFullYear(),month.getMonth(),index+1))];},[month]);
 return <div className={styles.root} ref={root}><button type="button" className={styles.trigger} onClick={()=>setOpen(current=>!current)} aria-label={ariaLabel} aria-expanded={open}><span>{value ? dateAtMidnight(value).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : 'Select date'}</span><CalendarDays size={17}/></button>{open?<div className={styles.popup}><div className={styles.month}><button type="button" onClick={()=>setMonth(current=>new Date(current.getFullYear(),current.getMonth()-1,1))}><ChevronLeft size={17}/></button><strong>{month.toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</strong><button type="button" onClick={()=>setMonth(current=>new Date(current.getFullYear(),current.getMonth()+1,1))}><ChevronRight size={17}/></button></div><div className={styles.weekdays}>{['Su','Mo','Tu','We','Th','Fr','Sa'].map(day=><span key={day}>{day}</span>)}</div><div className={styles.days}>{days.map((day,index)=>day?<button type="button" key={toValue(day)} disabled={Boolean(min&&toValue(day)<min)} className={value===toValue(day)?styles.selected:undefined} onClick={()=>{onChange(toValue(day));setOpen(false);}}>{day.getDate()}</button>:<span key={`blank-${index}`}/>)}</div></div>:null}</div>;
}

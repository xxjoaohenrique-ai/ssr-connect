import * as React from 'react';
import { cn } from '@/lib/utils';

/** Imagem responsiva independente de CDN externa. */
export const Image = React.forwardRef(function Image({
  src, fittingType='fill', aspectRatio, className, style, originWidth,
  originHeight, focalPointX, focalPointY, quality, onError, ...props
}, ref) {
  const fallback = `${import.meta.env.BASE_URL}images/fallback.svg`;
  const [current,setCurrent]=React.useState(src||fallback);
  React.useEffect(()=>setCurrent(src||fallback),[src]);
  return <img
    ref={ref}
    src={current}
    loading="lazy"
    className={cn(fittingType==='fit'?'object-contain':'object-cover',className)}
    style={{...style,aspectRatio}}
    onError={(event)=>{ if(current!==fallback) setCurrent(fallback); onError?.(event); }}
    {...props}
  />;
});

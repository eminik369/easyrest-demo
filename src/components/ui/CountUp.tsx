import ReactCountUp from 'react-countup';

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  separator?: string;
  className?: string;
}

export function CountUp({
  end,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2.5,
  separator = '.',
  className = '',
}: CountUpProps) {
  return (
    <ReactCountUp
      end={end}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      duration={duration}
      separator={separator}
      enableScrollSpy
      scrollSpyOnce
      className={className}
    />
  );
}

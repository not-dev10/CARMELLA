
import { Link as RRLink } from 'react-router-dom';

export default function Link({ href, children, className, ...props }: any) {
    return (
        <RRLink to={href} className={className} {...props}>
            {children}
        </RRLink>
    );
}

import Container from './Container.jsx'
import { cn } from '../lib/cn.js'
import SectionHeading from './SectionHeading.jsx'

export default function Section({ id, className, containerClassName, title, description, headingAlign, children, ...props }) {
  return (
    <section id={id} className={cn('py-16', className)} {...props}>
      <Container className={containerClassName}>
        {title || description ? (
          <SectionHeading title={title} description={description} align={headingAlign} />
        ) : null}
        {children}
      </Container>
    </section>
  )
}


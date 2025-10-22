import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

function IndexPage() {
  return (
    <div className='space-y-4'>
      <h1 className='text-2x1 font-semibold tracking-tight'>Welcome on Low Budget Theta θ</h1>
      <p className='text-muted-foreground'>
        V0.1 : Explore users list and dark theme.
      </p>
      <Button asChild>
        <Link to='/users'>Go to Users list</Link>
      </Button>
    </div>
  )
}

export default IndexPage
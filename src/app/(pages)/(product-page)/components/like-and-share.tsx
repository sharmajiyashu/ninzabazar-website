import { Heart } from 'lucide-react'
import { Share2 } from 'lucide-react'
import { Button } from '@heroui/button'

const LikeAndShare = () => {
  return (
    <div className="flex flex-row items-center space-x-2 ">
      <Button className="px-2 py-2 border border-white rounded-full shadow-xl hover:border-green hover:border hover:text-green text-disabledgrey">
        <Heart size="20px" />
      </Button>
      <Button className="px-2 py-2 border border-white rounded-full shadow-xl hover:border-green hover:border hover:text-green text-disabledgrey">
        <Share2 size="20px" />
      </Button>
    </div>
  )
}

export default LikeAndShare

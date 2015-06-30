module Control.Monad.Aff.Debug.Trace where
  --import qualified Debug.Trace as T

  import Control.Monad.Aff
  import Control.Monad.Eff.Class(liftEff)
  import Prelude

  -- | Traces any `Show`-able value to the console. This basically saves you 
  -- | from writing `liftEff $ trace x` everywhere.
  --trace :: forall e a. (Show a) => a -> Aff (trace :: T.Trace | e) a
  trace :: forall e a. (Show a) => a -> Aff (| e) a
  trace a = do
    -- XXX where import Debug.Trace in 0.7 from?
    --liftEff $ T.trace (show a)
    return a

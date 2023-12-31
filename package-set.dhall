let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.8.3-20230224/package-set.dhall
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let
  -- This is where you can add your own packages to the package-set
  additions =
    [
      { name = "uuid"
      , repo = "https://github.com/aviate-labs/uuid.mo"
      , version = "v0.2.0"
      , dependencies = [ "base" ]
      },
      { name = "array"
      , repo = "https://github.com/aviate-labs/array.mo"
      , version = "v0.1.1"
      , dependencies = [ "base" ]
      },
      { name = "encoding"
      , repo = "https://github.com/aviate-labs/encoding.mo"
      , version = "v0.3.2"
      , dependencies = [ "array", "base" ]
      },
      { name = "crypto"
      , repo = "https://github.com/aviate-labs/crypto.mo"
      , version = "v0.2.0"
      , dependencies = ["base"]
      },
      { name = "io"
      , repo = "https://github.com/aviate-labs/io.mo"
      , version = "v0.3.1"
      , dependencies = ["base"]
      },
      { name = "rand"
      , repo = "https://github.com/aviate-labs/rand.mo"
      , version = "v0.2.2"
      , dependencies = ["base", "io"]
      },
      { name = "parser-combinators"
      , repo = "https://github.com/aviate-labs/parser-combinators.mo"
      , version = "v0.1.1"
      , dependencies = [ "base" ]
      },
      { name = "json"
      , repo = "https://github.com/aviate-labs/json.mo"
      , version = "v0.2.0"
      , dependencies = [ "base", "parser-combinators" ]
      }
  ] : List Package

let
  {- This is where you can override existing packages in the package-set
     For example, if you wanted to use version `v2.0.0` of the foo library:
     let overrides = [
         { name = "foo"
         , version = "v2.0.0"
         , repo = "https://github.com/bar/foo"
         , dependencies = [] : List Text
         }
     ]
  -}
  overrides =
    [] : List Package

in  upstream # additions # overrides
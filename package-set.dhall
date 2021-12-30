let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.6.5-20210729/package-set.dhall sha256:6f30b0de62cf03760e60c7e6e9d681a321fa9825f308828a616b0f627bd88953
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let
  -- This is where you can add your own packages to the package-set
  additions =
    [{ name = "uuid"
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
      , version = "v0.3.1"
      , dependencies = [ "array", "base" ]
      },
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

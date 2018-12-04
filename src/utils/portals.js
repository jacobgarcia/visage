import React from 'react'

const { Consumer, Provider } = React.createContext({
  toggle: () => {},
  value: false,
  saving: false,
  stopSaving: () => {},
})

export const SaverConsumer = Consumer
export const SaverProvider = Provider

export function withSaver(Component) {
  return function ComponentWithSaver(props) {
    return (
      <SaverConsumer>
        {({
          toggle,
          saving,
          stopSaving,
          setSaveFunction,
          setFilterFunction,
          onToggle,
        }) => (
          <Component
            {...props}
            toggle={toggle}
            saving={saving}
            stopSaving={stopSaving}
            setSaveFunction={setSaveFunction}
            setFilterFunction={setFilterFunction}
            onToggle={onToggle}
          />
        )}
      </SaverConsumer>
    )
  }
}

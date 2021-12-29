import Loki from 'lokijs'

const newDB = (file: string): Promise<Loki> => {
  return new Promise(resolve => {
    const databaseInitializer = () => {
      let markers = db.getCollection('markers')
      if (markers === null) {
        markers = db.addCollection('markers')
      }
      resolve(db)
    }

    const db = new Loki(file, {
      autoload: true,
      autosave: true,
      autosaveInterval: 4000,
      autoloadCallback: databaseInitializer
    })
  })
}

export default newDB

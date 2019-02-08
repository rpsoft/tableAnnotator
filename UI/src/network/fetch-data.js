import HttpClient from './http-client';
import { URL_BASE } from '../links'


const urlBase = URL_BASE + 'api/'

export default class fetchData {
  constructor() {
    this.httpClient = new HttpClient()
  }

  async getGeneric(path) {
    let result

    try {
      result = await this.httpClient.send('', { path })
    } catch(error) {
      console.error('fetching template list error > ' + error)
    }

    return result
  }

  async saveAnnotation(docid,page,user,annotation,corrupted, tableType, corrupted_text) {

    var urlQueryRequest = urlBase+ "recordAnnotation?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user+"&annotation="+encodeURIComponent(JSON.stringify(annotation))+"&corrupted="+ (corrupted == undefined ? false : corrupted)+"&tableType="+tableType + "&corrupted_text=" + corrupted_text

    console.log(urlQueryRequest)

    var r = await this.getGeneric( urlQueryRequest  )
    // debugger
    return r

  }

  async getTable(docid,page) {

        var urlQueryRequest = urlBase+ "getTable?docid="+encodeURIComponent(docid)+"&page="+page

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }

  async getAnnotationPreview(docid,page,user) {

        var urlQueryRequest = urlBase+ "annotationPreview?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }

  async getAnnotationByID(docid,page,user) {

        var urlQueryRequest = urlBase+ "getAnnotationByID?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }

  async getAllInfo() {

        var urlQueryRequest = urlBase+ "allMetaData"

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }

  async getAllAnnotations() {

        var urlQueryRequest = urlBase+ "getAnnotations"

        var r = await this.getGeneric( urlQueryRequest  )

        return r

  }


}

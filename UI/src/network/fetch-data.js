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
  //
  // async getAllEntries() {
  //   return await this.getGeneric( urlBase + 'allEntries' )
  // }
  //
  // async getStaticPage(page) {
  //   return await this.getGeneric( urlBase + 'staticPage?page='+page )
  // }
  //
  // async getAllEntriesPaged(page,limit,sortField,direction) {
  //   return await this.getGeneric( urlBase + 'allEntriesPaged?page='+page
  //                                         +"&limit="+limit
  //                                         + ( sortField ? "&sortField="+sortField : "" )
  //                                         + ( direction ? "&direction="+direction : "" ) )
  // }

  async saveAnnotation(docid,page,user,annotation,corrupted, tableType) {

    var urlQueryRequest = urlBase+ "recordAnnotation?docid="+encodeURIComponent(docid)+"&page="+page+"&user="+user+"&annotation="+encodeURIComponent(JSON.stringify(annotation))+"&corrupted="+ (corrupted == undefined ? false : corrupted)+"&tableType="+tableType

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

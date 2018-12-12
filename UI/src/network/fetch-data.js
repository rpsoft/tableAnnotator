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

  async getTable(docid,page) {

        var urlQueryRequest = urlBase+ "getTable?docid="+docid+"&page="+page

        var r = await this.getGeneric( urlQueryRequest  )
        // debugger
        return r

  }


}
